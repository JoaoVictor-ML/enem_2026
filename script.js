/* =========================================================
   ENEM 2026 — RETA FINAL
   Cronograma, progresso local e sincronização Firebase
   =========================================================

   ARQUIVOS NECESSÁRIOS:
   - index.html
   - style.css
   - script.js

   PARA ATIVAR O FIREBASE:
   1. Crie um projeto em https://console.firebase.google.com/
   2. Adicione um aplicativo Web.
   3. Copie as credenciais para firebaseConfig abaixo.
   4. Ative Authentication > Google.
   5. Crie o Firestore Database.
   6. Configure as regras do Firestore conforme as instruções
      após este código.

   Sem Firebase configurado, o site continua funcionando
   usando o localStorage do navegador.
   ========================================================= */


/* =========================================================
   1. CONFIGURAÇÃO DO FIREBASE
   ========================================================= */


const firebaseConfig = {
  apiKey: "AIzaSyAYkkK2XSfs1J2yrg-BjUxZJ5q0MjRN2QY",
  authDomain: "enem2026--reta-final.firebaseapp.com",
  projectId: "enem2026--reta-final",
  storageBucket: "enem2026--reta-final.firebasestorage.app",
  messagingSenderId: "874200911528",
  appId: "1:874200911528:web:7c127a88c4170f6b103c9d",
  measurementId: "G-CT4NG898QD"
};

/* =========================================================
   2. CONSTANTES E ESTADO
   ========================================================= */

const STORAGE_KEY = "enem2026-reta-final-progress-v1";

const FIREBASE_VERSION = "11.6.0";

const firebaseConfigured = () => {
    return Boolean(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        firebaseConfig.appId &&
        !firebaseConfig.apiKey.startsWith("COLE_") &&
        !firebaseConfig.projectId.startsWith("SEU_") &&
        !firebaseConfig.authDomain.startsWith("SEU_") &&
        !firebaseConfig.appId.startsWith("COLE_")
    );
};

let firebaseApp = null;
let auth = null;
let db = null;

let currentUser = null;
let currentFilter = "todos";

let cloudReady = false;
let cloudSyncing = false;
let isApplyingCloudData = false;

let cloudModules = null;

let progress = loadLocalProgress();

let toastTimeout = null;


/* =========================================================
   3. CRONOGRAMA: 28 DE OUTUBRO A 7 DE NOVEMBRO
   Cada tarefa segue a estrutura:
   [categoria, título, descrição]
   ========================================================= */

const days = [
    {
        date: "28/10",
        weekday: "QUARTA-FEIRA",
        title: "Interpretação e base matemática",
        subtitle: "Fundamentos para começar a revisão",
        tasks: [
            [
                "linguagens",
                "Interpretação de texto",
                "Identifique tema, tese, informações explícitas e implícitas, inferências e ironia."
            ],
            [
                "linguagens",
                "Gêneros e funções da linguagem",
                "Revise finalidade comunicativa, público-alvo, contexto, funções da linguagem e gêneros textuais."
            ],
            [
                "redacao",
                "Estrutura da redação ENEM",
                "Revise introdução com tese, dois desenvolvimentos argumentativos e conclusão com proposta de intervenção."
            ],
            [
                "exatas",
                "Razão, proporção e regra de três",
                "Pratique proporcionalidade direta e inversa, escalas, porcentagem e situações cotidianas."
            ],
            [
                "linguagens",
                "Questões de Linguagens",
                "Resolva pelo menos 15 questões de provas anteriores e registre os erros."
            ],
            [
                "exatas",
                "Questões de Matemática",
                "Resolva pelo menos 10 questões de razão, proporção e porcentagem."
            ]
        ]
    },

    {
        date: "29/10",
        weekday: "QUINTA-FEIRA",
        title: "Argumentação e estatística",
        subtitle: "Leitura crítica e interpretação de dados",
        tasks: [
            [
                "linguagens",
                "Gêneros e tipologias textuais",
                "Diferencie narração, descrição, exposição, argumentação e injunção; relacione forma e finalidade."
            ],
            [
                "redacao",
                "Tese e projeto de texto",
                "Escolha uma tese clara e organize dois argumentos diferentes antes de escrever."
            ],
            [
                "redacao",
                "Repertório sociocultural",
                "Treine a aplicação de repertórios pertinentes, produtivos e relacionados diretamente ao tema."
            ],
            [
                "exatas",
                "Estatística básica",
                "Revise média aritmética, média ponderada, mediana, moda e leitura de tabelas."
            ],
            [
                "exatas",
                "Gráficos e porcentagens",
                "Interprete gráficos de barras, linhas e setores; calcule variações percentuais."
            ],
            [
                "linguagens",
                "Questões de interpretação",
                "Resolva questões de provas anteriores e explique por que as alternativas incorretas estão erradas."
            ]
        ]
    },

    {
        date: "30/10",
        weekday: "SEXTA-FEIRA",
        title: "Figuras de linguagem e geometria",
        subtitle: "Recursos expressivos e problemas visuais",
        tasks: [
            [
                "linguagens",
                "Figuras de linguagem",
                "Revise metáfora, comparação, metonímia, ironia, hipérbole, antítese, paradoxo e personificação."
            ],
            [
                "linguagens",
                "Variação linguística",
                "Estude variedades regionais, sociais e históricas, adequação linguística e preconceito linguístico."
            ],
            [
                "redacao",
                "Argumentação no desenvolvimento",
                "Treine tópico frasal, explicação, exemplificação e ligação explícita entre argumento e tese."
            ],
            [
                "exatas",
                "Geometria plana",
                "Revise áreas e perímetros de triângulos, quadriláteros, círculos e figuras compostas."
            ],
            [
                "exatas",
                "Escalas e semelhança",
                "Pratique escalas, proporcionalidade entre lados e aplicações de semelhança de triângulos."
            ],
            [
                "exatas",
                "Questões de geometria",
                "Resolva questões contextualizadas e desenhe as figuras quando isso ajudar."
            ]
        ]
    },

    {
        date: "31/10",
        weekday: "SÁBADO",
        title: "Primeira redação completa",
        subtitle: "Treino cronometrado e correção",
        tasks: [
            [
                "redacao",
                "Redação completa cronometrada",
                "Escreva uma redação sobre um tema social relevante, planejando o texto antes de começar."
            ],
            [
                "redacao",
                "Autoavaliação por competências",
                "Analise domínio da norma-padrão, compreensão do tema, argumentação, coesão e intervenção."
            ],
            [
                "redacao",
                "Proposta de intervenção",
                "Inclua agente, ação, meio ou modo, finalidade e detalhamento, respeitando os direitos humanos."
            ],
            [
                "humanas",
                "História do Brasil: Colônia, Império e República",
                "Revise colonização, escravidão, Independência, abolição e formação da República, relacionando os processos às questões sociais."
            ],
            [
                "exatas",
                "Porcentagem e juros simples",
                "Pratique aumentos, descontos sucessivos, variação percentual e juros simples."
            ],
            [
                "humanas",
                "Geografia: população e urbanização",
                "Revise crescimento populacional, migrações, transição demográfica, urbanização e problemas socioespaciais."
            ]
        ]
    },

    {
        date: "01/11",
        weekday: "DOMINGO",
        title: "Literatura e probabilidade",
        subtitle: "Repertório literário e raciocínio matemático",
        tasks: [
            [
                "linguagens",
                "Modernismo brasileiro",
                "Revise características das fases modernistas, contexto histórico e ruptura com padrões tradicionais."
            ],
            [
                "humanas",
                "Filosofia: ética e política",
                "Revise ética, justiça, virtude, poder, democracia e contrato social, relacionando conceitos a situações contemporâneas."
            ],
            [
                "linguagens",
                "Artes e patrimônio cultural",
                "Revise arte brasileira, manifestações populares, patrimônio material e imaterial e diversidade cultural."
            ],
            [
                "exatas",
                "Probabilidade",
                "Revise espaço amostral, eventos, probabilidade simples e probabilidade complementar."
            ],
            [
                "exatas",
                "Princípio fundamental da contagem",
                "Resolva problemas de contagem com etapas sucessivas e restrições simples."
            ],
            [
                "humanas",
                "Sociologia: cultura e socialização",
                "Estude cultura, identidade, etnocentrismo, relativismo cultural e instituições de socialização."
            ]
        ]
    },

    {
        date: "02/11",
        weekday: "SEGUNDA-FEIRA",
        title: "Artes, mídia e funções",
        subtitle: "Linguagens multimodais e álgebra",
        tasks: [
            [
                "linguagens",
                "Vanguardas e arte contemporânea",
                "Relacione movimentos artísticos ao contexto histórico, às características estéticas e às críticas sociais."
            ],
            [
                "humanas",
                "Geografia: globalização e geopolítica",
                "Revise globalização, blocos econômicos, relações de poder, conflitos, organismos internacionais e nova ordem mundial."
            ],
            [
                "humanas",
                "História geral: mundo moderno e contemporâneo",
                "Retome Iluminismo, Revolução Industrial, Revolução Francesa, imperialismo e guerras mundiais."
            ],
            [
                "exatas",
                "Função afim",
                "Revise coeficientes, gráfico, raiz, crescimento, decrescimento e interpretação de problemas."
            ],
            [
                "exatas",
                "Função quadrática",
                "Pratique raízes, vértice, concavidade, máximo, mínimo e leitura do gráfico."
            ],
            [
                "linguagens",
                "Questões de provas anteriores",
                "Resolva questões de artes, publicidade e textos multimodais, justificando suas respostas."
            ]
        ]
    },

    {
        date: "03/11",
        weekday: "TERÇA-FEIRA",
        title: "Segunda redação e revisão gramatical",
        subtitle: "Produção textual e correção de erros",
        tasks: [
            [
                "humanas",
                "Filosofia: conhecimento e pensamento moderno",
                "Revise racionalismo, empirismo, ciência, senso comum e critérios de construção do conhecimento."
            ],
            [
                "humanas",
                "Sociologia: trabalho e desigualdade",
                "Estude divisão social do trabalho, classes sociais, desigualdade, estratificação e mudanças no mundo do trabalho."
            ],
            [
                "linguagens",
                "Pontuação e sintaxe",
                "Revise vírgula, período composto, concordância e relações sintáticas que afetam a clareza."
            ],
            [
                "linguagens",
                "Coesão referencial",
                "Pratique o uso de pronomes, expressões referenciais e conectivos sem repetição excessiva."
            ],
            [
                "exatas",
                "Unidades e conversões",
                "Revise conversões de comprimento, área, volume, massa, tempo e velocidade."
            ],
            [
                "exatas",
                "Médias e problemas contextualizados",
                "Resolva questões que combinem tabelas, gráficos, médias e operações básicas."
            ]
        ]
    },

    {
        date: "04/11",
        weekday: "QUARTA-FEIRA",
        title: "Revisão de Humanas e Natureza",
        subtitle: "Consolidação dos principais conteúdos",
        tasks: [
            [
                "humanas",
                "História: Brasil República",
                "Revise República Velha, Era Vargas, ditadura militar, redemocratização e Constituição de 1988."
            ],
            [
                "humanas",
                "Geografia: meio ambiente",
                "Estude mudanças climáticas, desmatamento, biomas brasileiros, impactos ambientais e sustentabilidade."
            ],
            [
                "humanas",
                "Sociologia: cidadania e movimentos sociais",
                "Revise direitos civis, políticos e sociais, participação popular e movimentos sociais."
            ],
            [
                "natureza",
                "Ecologia",
                "Revise cadeias e teias alimentares, relações ecológicas, ciclos biogeoquímicos e impactos ambientais."
            ],
            [
                "natureza",
                "Física: eletricidade",
                "Revise potência elétrica, consumo de energia, resistência, tensão e corrente elétrica."
            ],
            [
                "natureza",
                "Química: soluções",
                "Pratique concentração comum, diluição, mistura de soluções e interpretação de rótulos."
            ]
        ]
    },

    {
        date: "05/11",
        weekday: "QUINTA-FEIRA",
        title: "Revisão geral e questões",
        subtitle: "Treino com provas anteriores",
        tasks: [
            [
                "humanas",
                "História geral: guerras e conflitos",
                "Revise imperialismo, Primeira Guerra Mundial, Segunda Guerra Mundial, nazifascismo e Guerra Fria."
            ],
            [
                "humanas",
                "Geografia: questão agrária",
                "Estude estrutura fundiária, concentração de terras, agronegócio, agricultura familiar e conflitos no campo."
            ],
            [
                "humanas",
                "Filosofia: democracia e cidadania",
                "Revise democracia, participação política, direitos humanos, justiça e organização do Estado."
            ],
            [
                "humanas",
                "Questões de Ciências Humanas",
                "Resolva questões de História, Geografia, Filosofia e Sociologia e analise os erros."
            ],
            [
                "linguagens",
                "Interpretação de textos",
                "Resolva questões de Linguagens priorizando leitura crítica, contexto e finalidade comunicativa."
            ],
            [
                "exatas",
                "Revisão de Matemática",
                "Retome os assuntos com maior número de erros no seu caderno de questões."
            ]
        ]
    },

    {
        date: "06/11",
        weekday: "SEXTA-FEIRA",
        title: "Simulado e revisão direcionada",
        subtitle: "Treino de resistência e estratégia",
        tasks: [
            [
                "geral",
                "Simulado de Linguagens e Humanas",
                "Resolva questões de provas anteriores respeitando o tempo disponível para o primeiro dia."
            ],
            [
                "geral",
                "Correção do simulado",
                "Identifique erros por falta de conteúdo, interpretação ou administração do tempo."
            ],
            [
                "redacao",
                "Planejamento de redação",
                "Faça um planejamento completo com tese, argumentos, repertório e proposta de intervenção."
            ],
            [
                "humanas",
                "Revisão dos erros de Humanas",
                "Retome os conceitos de História, Geografia, Filosofia e Sociologia que apareceram nas questões erradas."
            ],
            [
                "linguagens",
                "Revisão dos erros de Linguagens",
                "Retome interpretação, gêneros textuais, funções da linguagem e recursos expressivos."
            ],
            [
                "geral",
                "Organização para a prova",
                "Confira documento, canetas, cartão de confirmação e logística de deslocamento."
            ]
        ]
    },

    {
        date: "07/11",
        weekday: "SÁBADO",
        title: "Véspera do primeiro dia",
        subtitle: "Revisão leve e descanso",
        tasks: [
            [
                "linguagens",
                "Revisão leve de Linguagens",
                "Revise interpretação, gêneros textuais, literatura e artes sem tentar aprender conteúdos novos."
            ],
            [
                "humanas",
                "Revisão leve de Ciências Humanas",
                "Leia seus resumos de História, Geografia, Filosofia e Sociologia e retome conceitos-chave."
            ],
            [
                "redacao",
                "Estrutura da redação",
                "Relembre a estrutura dissertativo-argumentativa e os elementos da proposta de intervenção."
            ],
            [
                "geral",
                "Preparação para o ENEM",
                "Confira o Cartão de Confirmação, o endereço da prova e o tempo necessário para chegar."
            ],
            [
                "geral",
                "Encerrar os estudos e descansar",
                "Evite virar a noite. Priorize alimentação habitual, hidratação e uma noite de sono adequada."
            ]
        ]
    }
];


/* =========================================================
   4. REVISÃO DE EXATAS: 9 A 14 DE NOVEMBRO
   ========================================================= */

const afterDays = [
    {
        date: "09/11",
        title: "Matemática financeira e estatística",
        tasks: [
            [
                "exatas",
                "Porcentagem e juros",
                "Revise aumentos, descontos, juros simples e compostos e variação percentual."
            ],
            [
                "exatas",
                "Estatística",
                "Pratique média, mediana, moda, gráficos e tabelas."
            ],
            [
                "exatas",
                "Questões do ENEM",
                "Resolva questões contextualizadas e revise os erros."
            ]
        ]
    },
    {
        date: "10/11",
        title: "Geometria plana e espacial",
        tasks: [
            [
                "exatas",
                "Geometria plana",
                "Revise áreas, perímetros, semelhança e escala."
            ],
            [
                "exatas",
                "Geometria espacial",
                "Revise volumes e áreas de prismas, cilindros, cones, pirâmides e esferas."
            ],
            [
                "exatas",
                "Questões de geometria",
                "Pratique problemas com medidas, embalagens, reservatórios e construções."
            ]
        ]
    },
    {
        date: "11/11",
        title: "Combinatória, probabilidade e funções",
        tasks: [
            [
                "exatas",
                "Análise combinatória",
                "Pratique princípio fundamental da contagem, permutação, arranjo e combinação."
            ],
            [
                "exatas",
                "Probabilidade",
                "Resolva problemas com eventos, espaço amostral e probabilidade complementar."
            ],
            [
                "exatas",
                "Funções",
                "Revise função afim, quadrática, interpretação de gráficos e problemas contextualizados."
            ]
        ]
    },
    {
        date: "12/11",
        title: "Física: mecânica, energia e eletricidade",
        tasks: [
            [
                "exatas",
                "Mecânica",
                "Revise velocidade média, aceleração, leis de Newton e forças."
            ],
            [
                "exatas",
                "Trabalho e energia",
                "Pratique energia cinética, potencial, conservação de energia e potência."
            ],
            [
                "exatas",
                "Eletricidade",
                "Revise tensão, corrente, resistência, potência elétrica e consumo de energia."
            ]
        ]
    },
    {
        date: "13/11",
        title: "Química e Biologia",
        tasks: [
            [
                "exatas",
                "Química",
                "Revise estequiometria, soluções, concentração, química orgânica e eletroquímica."
            ],
            [
                "natureza",
                "Biologia: ecologia",
                "Estude relações ecológicas, cadeias alimentares, ciclos e impactos ambientais."
            ],
            [
                "natureza",
                "Biologia: genética e fisiologia",
                "Revise conceitos básicos e resolva questões de provas anteriores."
            ]
        ]
    },
    {
        date: "14/11",
        title: "Revisão final e caderno de erros",
        tasks: [
            [
                "exatas",
                "Questões mistas de Matemática",
                "Resolva questões dos temas em que ainda apresenta maior dificuldade."
            ],
            [
                "natureza",
                "Questões mistas de Ciências da Natureza",
                "Revise Física, Química e Biologia a partir das questões erradas."
            ],
            [
                "geral",
                "Revisão de erros recorrentes",
                "Registre o raciocínio correto e os sinais de alerta para não repetir os mesmos erros."
            ]
        ]
    }
];


/* =========================================================
   5. ACESSO AO DOM
   ========================================================= */

const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

const scheduleElement = $("#schedule");
const afterDaysElement = $("#afterDays");

const progressText = $("#progressText");
const progressPercent = $("#progressPercent");
const progressFill = $("#progressFill");
const remainingText = $("#remainingText");

const cloudStatus = $("#cloudStatus");

const googleSignInButton = $("#googleSignIn");
const googleButtonText = $("#googleButtonText");

const resetProgressButton = $("#resetProgress");

const setupModal = $("#setupModal");
const closeSetupButton = $("#closeSetup");

const toastElement = $("#toast");


/* =========================================================
   6. UTILITÁRIOS
   ========================================================= */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function showToast(message, type = "success") {
    if (!toastElement) {
        console.log(message);
        return;
    }

    clearTimeout(toastTimeout);

    toastElement.textContent = message;
    toastElement.classList.toggle("error", type === "error");
    toastElement.classList.add("show");

    toastTimeout = setTimeout(() => {
        toastElement.classList.remove("show");
    }, 3500);
}

function setCloudStatus(message, connected = false) {
    if (!cloudStatus) return;

    const indicator = cloudStatus.querySelector("i");

    cloudStatus.setAttribute("title", message);

    if (indicator) {
        indicator.style.background = connected
            ? "var(--jade)"
            : "var(--text-muted)";

        indicator.style.boxShadow = connected
            ? "0 0 12px rgba(53, 224, 161, 0.55)"
            : "none";
    }

    const existingText = [...cloudStatus.childNodes].find(
        node => node.nodeType === Node.TEXT_NODE &&
            node.textContent.trim()
    );

    if (existingText) {
        existingText.textContent = ` ${message}`;
    } else if (!indicator) {
        cloudStatus.textContent = message;
    }
}

function updateGoogleButton() {
    if (!googleSignInButton) return;

    if (currentUser) {
        if (googleButtonText) {
            googleButtonText.textContent =
                currentUser.displayName || "Conta conectada";
        }

        googleSignInButton.setAttribute(
            "title",
            `Conectado como ${currentUser.email || ""}. Clique para sair.`
        );
    } else {
        if (googleButtonText) {
            googleButtonText.textContent = "Entrar com Google";
        }

        googleSignInButton.setAttribute(
            "title",
            "Entrar com Google"
        );
    }
}


/* =========================================================
   7. PROGRESSO LOCAL
   ========================================================= */

function loadLocalProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return { completed: [] };
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed.completed)) {
            return { completed: [] };
        }

        return {
            completed: parsed.completed
        };
    } catch (error) {
        console.error("Erro ao carregar progresso:", error);

        return { completed: [] };
    }
}

function saveLocalProgress() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(progress)
        );
    } catch (error) {
        console.error("Erro ao salvar progresso:", error);

        showToast(
            "Não foi possível salvar o progresso local.",
            "error"
        );
    }
}

function isCompleted(taskId) {
    return progress.completed.includes(taskId);
}

function setCompleted(taskId, completed) {
    if (isApplyingCloudData) return;

    if (completed) {
        if (!progress.completed.includes(taskId)) {
            progress.completed.push(taskId);
        }
    } else {
        progress.completed = progress.completed.filter(
            id => id !== taskId
        );
    }

    saveLocalProgress();
    updateProgressDisplay();

    if (currentUser && cloudReady) {
        scheduleCloudSave();
    }
}

function getTotalTaskCount() {
    const firstDays = days.reduce(
        (total, day) => total + day.tasks.length,
        0
    );

    const secondDays = afterDays.reduce(
        (total, day) => total + day.tasks.length,
        0
    );

    return firstDays + secondDays;
}

function getCompletedTaskCount() {
    return progress.completed.length;
}


/* =========================================================
   8. CONSTRUÇÃO DAS TAREFAS
   ========================================================= */

function createTaskHTML(task, taskId) {
    const [category, title, description] = task;

    const completed = isCompleted(taskId);

    const categoryNames = {
        linguagens: "Linguagens",
        redacao: "Redação",
        exatas: "Matemática",
        humanas: "Humanas",
        natureza: "Natureza",
        geral: "Geral"
    };

    return `
        <label class="task-item ${completed ? "completed" : ""}">
            <input
                type="checkbox"
                data-task-id="${escapeHTML(taskId)}"
                ${completed ? "checked" : ""}
            >

            <span class="task-checkbox"></span>

            <span class="task-content">
                <span class="task-category ${escapeHTML(category)}">
                    ${escapeHTML(categoryNames[category] || category)}
                </span>

                <strong>${escapeHTML(title)}</strong>

                <span class="task-description">
                    ${escapeHTML(description)}
                </span>
            </span>
        </label>
    `;
}


/* =========================================================
   9. RENDERIZAÇÃO DO CRONOGRAMA
   ========================================================= */

function renderSchedule() {
    if (!scheduleElement) return;

    scheduleElement.innerHTML = days.map((day, dayIndex) => {
        const completedCount = day.tasks.filter((task, taskIndex) =>
            isCompleted(`day-${dayIndex}-task-${taskIndex}`)
        ).length;

        const completedDay =
            completedCount === day.tasks.length;

        const categories = [
            ...new Set(day.tasks.map(task => task[0]))
        ];

        const hasHumanas = categories.includes("humanas");

        const hasExatas = categories.includes("exatas");

        return `
            <article
                class="schedule-day ${completedDay ? "completed" : ""}"
                data-day-index="${dayIndex}"
                data-primeiro="true"
                data-exatas="${hasExatas}"
            >
                <button
                    class="day-header"
                    type="button"
                    aria-expanded="false"
                >
                    <span class="day-number">
                        ${escapeHTML(day.date)}
                    </span>

                    <span class="day-heading">
                        <span class="day-weekday">
                            ${escapeHTML(day.weekday)}
                        </span>

                        <h3>${escapeHTML(day.title)}</h3>

                        <p>${escapeHTML(day.subtitle)}</p>

                        <span class="day-tags">
                            ${categories.map(category => `
                                <span class="day-tag ${escapeHTML(category)}">
                                    ${escapeHTML(category)}
                                </span>
                            `).join("")}
                        </span>
                    </span>

                    <span class="day-chevron" aria-hidden="true">
                        ↓
                    </span>
                </button>

                <div class="day-content">
                    <div class="task-list">
                        ${day.tasks.map((task, taskIndex) =>
                            createTaskHTML(
                                task,
                                `day-${dayIndex}-task-${taskIndex}`
                            )
                        ).join("")}
                    </div>

                    <div class="day-footer">
                        <span>${day.tasks.length} atividades planejadas</span>

                        <span class="day-completion">
                            ${completedCount}/${day.tasks.length} concluídas
                        </span>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    applyFilter();
}

function renderAfterDays() {
    if (!afterDaysElement) return;

    afterDaysElement.innerHTML = afterDays.map((day, dayIndex) => {
        const completedCount = day.tasks.filter((task, taskIndex) =>
            isCompleted(`after-${dayIndex}-task-${taskIndex}`)
        ).length;

        const completedDay =
            completedCount === day.tasks.length;

        return `
            <article class="schedule-day ${completedDay ? "completed" : ""}">
                <button
                    class="day-header"
                    type="button"
                    aria-expanded="false"
                >
                    <span class="day-number">
                        ${escapeHTML(day.date)}
                    </span>

                    <span class="day-heading">
                        <h3>${escapeHTML(day.title)}</h3>
                        <p>REVISÃO DE EXATAS E NATUREZA</p>
                    </span>

                    <span class="day-chevron" aria-hidden="true">
                        ↓
                    </span>
                </button>

                <div class="day-content">
                    <div class="task-list">
                        ${day.tasks.map((task, taskIndex) =>
                            createTaskHTML(
                                task,
                                `after-${dayIndex}-task-${taskIndex}`
                            )
                        ).join("")}
                    </div>

                    <div class="day-footer">
                        <span>${day.tasks.length} atividades planejadas</span>
                        <span class="day-completion">
                            ${completedCount}/${day.tasks.length} concluídas
                        </span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}


/* =========================================================
   10. FILTROS
   ========================================================= */

function applyFilter() {
    const dayCards = $$(".schedule-day", scheduleElement);

    dayCards.forEach(card => {
        let visible = true;

        if (currentFilter === "primeiro") {
            visible = card.dataset.primeiro === "true";
        }

        if (currentFilter === "exatas") {
            visible = card.dataset.exatas === "true";
        }

        if (currentFilter === "humanas") {
            visible = card.querySelector(".day-tag.humanas") !== null;
        }

        card.hidden = !visible;
    });

    if (afterDaysElement) {
        afterDaysElement.hidden =
            currentFilter === "primeiro" ||
            currentFilter === "humanas";
    }
}

function setupFilters() {
    const filterButtons = $$("[data-filter]");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter || "todos";

            filterButtons.forEach(item => {
                item.classList.toggle(
                    "active",
                    item === button
                );
            });

            applyFilter();
        });
    });
}


/* =========================================================
   11. PROGRESSO
   ========================================================= */

function updateProgressDisplay() {
    const total = getTotalTaskCount();
    const completed = getCompletedTaskCount();

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const remaining = Math.max(0, total - completed);

    if (progressText) {
        progressText.textContent = `${completed}/${total}`;
    }

    if (progressPercent) {
        progressPercent.textContent = `${percentage}%`;
    }

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }

    if (remainingText) {
        remainingText.textContent =
            `${remaining} atividades restantes`;
    }

    updateDayCompletion();
}

function updateDayCompletion() {
    days.forEach((day, dayIndex) => {
        const card = $(
            `[data-day-index="${dayIndex}"]`,
            scheduleElement
        );

        if (!card) return;

        const completedCount = day.tasks.filter((task, taskIndex) =>
            isCompleted(`day-${dayIndex}-task-${taskIndex}`)
        ).length;

        const completedDay =
            completedCount === day.tasks.length;

        card.classList.toggle("completed", completedDay);

        const completion = $(".day-completion", card);

        if (completion) {
            completion.textContent =
                `${completedCount}/${day.tasks.length} concluídas`;
        }
    });

    afterDays.forEach((day, dayIndex) => {
        const card = afterDaysElement?.children[dayIndex];

        if (!card) return;

        const completedCount = day.tasks.filter((task, taskIndex) =>
            isCompleted(`after-${dayIndex}-task-${taskIndex}`)
        ).length;

        const completedDay =
            completedCount === day.tasks.length;

        card.classList.toggle("completed", completedDay);

        const completion = $(".day-completion", card);

        if (completion) {
            completion.textContent =
                `${completedCount}/${day.tasks.length} concluídas`;
        }
    });
}


/* =========================================================
   12. EVENTOS DAS TAREFAS
   ========================================================= */

function setupTaskEvents() {
    document.addEventListener("change", event => {
        const checkbox = event.target.closest(
            'input[type="checkbox"][data-task-id]'
        );

        if (!checkbox) return;

        setCompleted(
            checkbox.dataset.taskId,
            checkbox.checked
        );

        const taskItem = checkbox.closest(".task-item");

        if (taskItem) {
            taskItem.classList.toggle(
                "completed",
                checkbox.checked
            );
        }
    });

    document.addEventListener("click", event => {
        const header = event.target.closest(".day-header");

        if (!header) return;

        const card = header.closest(".schedule-day");
        const content = $(".day-content", card);

        if (!content) return;

        const isOpen = card.classList.toggle("open");

        header.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });
}


/* =========================================================
   13. RESETAR PROGRESSO
   ========================================================= */

function resetProgress() {
    const confirmed = confirm(
        "Tem certeza de que deseja apagar todo o progresso?"
    );

    if (!confirmed) return;

    progress = { completed: [] };

    saveLocalProgress();

    renderSchedule();
    renderAfterDays();
    updateProgressDisplay();

    if (currentUser && cloudReady) {
        scheduleCloudSave();
    }

    showToast("Progresso reiniciado.");
}

function setupResetButton() {
    if (!resetProgressButton) return;

    resetProgressButton.addEventListener(
        "click",
        resetProgress
    );
}


/* =========================================================
   14. FIREBASE — CARREGAMENTO DOS MÓDULOS
   ========================================================= */

async function loadFirebaseModules() {
    if (!firebaseConfigured()) {
        return null;
    }

    if (cloudModules) {
        return cloudModules;
    }

    try {
        const appModule = await import(
            `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`
        );

        const authModule = await import(
            `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`
        );

        const firestoreModule = await import(
            `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`
        );

        cloudModules = {
            initializeApp: appModule.initializeApp,
            getAuth: authModule.getAuth,
            GoogleAuthProvider: authModule.GoogleAuthProvider,
            signInWithPopup: authModule.signInWithPopup,
            signOut: authModule.signOut,
            onAuthStateChanged: authModule.onAuthStateChanged,
            getFirestore: firestoreModule.getFirestore,
            doc: firestoreModule.doc,
            getDoc: firestoreModule.getDoc,
            setDoc: firestoreModule.setDoc,
            serverTimestamp: firestoreModule.serverTimestamp
        };

        return cloudModules;
    } catch (error) {
        console.error(
            "Não foi possível carregar os módulos Firebase:",
            error
        );

        showToast(
            "Erro ao carregar o Firebase. Verifique sua conexão.",
            "error"
        );

        return null;
    }
}


/* =========================================================
   15. FIREBASE — INICIALIZAÇÃO
   ========================================================= */

async function initializeFirebase() {
    if (!firebaseConfigured()) {
        setCloudStatus("Salvamento local", false);
        return;
    }

    const modules = await loadFirebaseModules();

    if (!modules) {
        setCloudStatus("Firebase indisponível", false);
        return;
    }

    try {
        firebaseApp = modules.initializeApp(firebaseConfig);

        auth = modules.getAuth(firebaseApp);

        db = modules.getFirestore(firebaseApp);

        modules.onAuthStateChanged(auth, async user => {
            currentUser = user;

            updateGoogleButton();

            if (user) {
                setCloudStatus("Conectando à nuvem...", false);

                await loadCloudProgress();
            } else {
                cloudReady = false;

                setCloudStatus("Salvamento local", false);
            }
        });

    } catch (error) {
        console.error(
            "Erro ao inicializar Firebase:",
            error
        );

        setCloudStatus("Erro no Firebase", false);
    }
}


/* =========================================================
   16. FIREBASE — LOGIN GOOGLE
   ========================================================= */

async function handleGoogleSignIn() {
    if (!firebaseConfigured()) {
        showToast(
            "Configure o Firebase antes de entrar com Google.",
            "error"
        );

        if (setupModal) {
            setupModal.classList.add("open");
        }

        return;
    }

    if (!auth || !cloudModules) {
        showToast(
            "O Firebase ainda está carregando.",
            "error"
        );

        return;
    }

    try {
        if (currentUser) {
            await cloudModules.signOut(auth);

            showToast("Você saiu da sua conta.");

            return;
        }

        const provider = new cloudModules.GoogleAuthProvider();

        await cloudModules.signInWithPopup(
            auth,
            provider
        );

    } catch (error) {
        console.error("Erro no login Google:", error);

        if (error.code === "auth/popup-blocked") {
            showToast(
                "O navegador bloqueou a janela de login.",
                "error"
            );
        } else if (error.code === "auth/unauthorized-domain") {
            showToast(
                "Este domínio não está autorizado no Firebase.",
                "error"
            );
        } else if (error.code === "auth/popup-closed-by-user") {
            showToast(
                "A janela de login foi fechada.",
                "error"
            );
        } else {
            showToast(
                "Não foi possível realizar o login.",
                "error"
            );
        }
    }
}


/* =========================================================
   17. FIREBASE — CARREGAR PROGRESSO DA NUVEM
   ========================================================= */

async function loadCloudProgress() {
    if (!currentUser || !db || !cloudModules) {
        return;
    }

    try {
        const reference = cloudModules.doc(
            db,
            "users",
            currentUser.uid,
            "data",
            "progress"
        );

        const snapshot = await cloudModules.getDoc(reference);

        isApplyingCloudData = true;

        if (snapshot.exists()) {
            const cloudData = snapshot.data();

            if (Array.isArray(cloudData.completed)) {
                progress.completed = cloudData.completed;

                saveLocalProgress();

                renderSchedule();
                renderAfterDays();
                updateProgressDisplay();
            }
        } else {
            await saveCloudProgress();
        }

        cloudReady = true;

        setCloudStatus("Sincronizado", true);

    } catch (error) {
        console.error(
            "Erro ao carregar progresso da nuvem:",
            error
        );

        cloudReady = false;

        setCloudStatus("Erro de sincronização", false);

        showToast(
            "Não foi possível carregar o progresso da nuvem.",
            "error"
        );
    } finally {
        isApplyingCloudData = false;
    }
}


/* =========================================================
   18. FIREBASE — SALVAR PROGRESSO NA NUVEM
   ========================================================= */

async function saveCloudProgress() {
    if (!currentUser || !db || !cloudModules) {
        return;
    }

    if (isApplyingCloudData) {
        return;
    }

    try {
        cloudSyncing = true;

        setCloudStatus("Sincronizando...", false);

        const reference = cloudModules.doc(
            db,
            "users",
            currentUser.uid,
            "data",
            "progress"
        );

        await cloudModules.setDoc(
            reference,
            {
                completed: progress.completed,
                updatedAt: cloudModules.serverTimestamp()
            },
            { merge: true }
        );

        cloudReady = true;

        setCloudStatus("Sincronizado", true);

    } catch (error) {
        console.error(
            "Erro ao salvar progresso na nuvem:",
            error
        );

        setCloudStatus("Falha na sincronização", false);

        showToast(
            "Não foi possível sincronizar o progresso.",
            "error"
        );
    } finally {
        cloudSyncing = false;
    }
}


/* =========================================================
   19. SINCRONIZAÇÃO AUTOMÁTICA
   ========================================================= */

let cloudSaveTimeout = null;

function scheduleCloudSave() {
    if (!currentUser || !cloudReady) {
        return;
    }

    clearTimeout(cloudSaveTimeout);

    cloudSaveTimeout = setTimeout(() => {
        saveCloudProgress();
    }, 800);
}


/* =========================================================
   20. EVENTOS DE AUTENTICAÇÃO
   ========================================================= */

function setupAuthentication() {
    if (!googleSignInButton) return;

    googleSignInButton.addEventListener(
        "click",
        handleGoogleSignIn
    );

    updateGoogleButton();
}


/* =========================================================
   21. MODAL DE CONFIGURAÇÃO
   ========================================================= */

function setupConfigurationModal() {
    if (closeSetupButton && setupModal) {
        closeSetupButton.addEventListener("click", () => {
            setupModal.classList.remove("open");
        });
    }

    if (setupModal) {
        setupModal.addEventListener("click", event => {
            if (event.target === setupModal) {
                setupModal.classList.remove("open");
            }
        });
    }
}


/* =========================================================
   22. INICIALIZAÇÃO DA APLICAÇÃO
   ========================================================= */

async function initializeApp() {
    renderSchedule();

    renderAfterDays();

    updateProgressDisplay();

    setupFilters();

    setupTaskEvents();

    setupResetButton();

    setupAuthentication();

    setupConfigurationModal();

    await initializeFirebase();

    console.log(
        "%cENEM RETA FINAL",
        "color:#35e0a1;font-size:18px;font-weight:bold;"
    );

    console.log(
        "Cronograma carregado. Progresso salvo no navegador."
    );
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApp,
        { once: true }
    );
} else {
    initializeApp();
}