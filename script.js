
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
                "linguagens",
                "Coesão e conectivos",
                "Revise relações de causa, consequência, oposição, concessão, conclusão e exemplificação."
            ],
            [
                "exatas",
                "Porcentagem e juros simples",
                "Pratique aumentos, descontos sucessivos, variação percentual e juros simples."
            ],
            [
                "linguagens",
                "Questões de provas anteriores",
                "Resolva um bloco de questões e anote os assuntos que ainda geram dúvidas."
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
                "linguagens",
                "Poesia e interpretação literária",
                "Analise voz poética, imagens, linguagem figurada, contexto e relação entre forma e conteúdo."
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
                "redacao",
                "Correção da redação",
                "Reescreva os trechos mais fracos do texto anterior, priorizando argumentação e coesão."
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
                "linguagens",
                "Publicidade e comunicação",
                "Analise campanhas, charges, tirinhas, memes e anúncios considerando imagem, texto e intenção."
            ],
            [
                "linguagens",
                "Tecnologia e comunicação",
                "Revise cultura digital, circulação de informações, mídias, persuasão e leitura crítica."
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
                "redacao",
                "Segunda redação completa",
                "Escreva outro texto cronometrado, buscando melhorar os pontos identificados na primeira correção."
            ],
            [
                "redacao",
                "Análise da argumentação",
                "Confira se os dois parágrafos de desenvolvimento apresentam argumentos distintos e bem explicados."
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
        title: "Simulado de Linguagens",
        subtitle: "Treino com tempo e revisão de erros",
        tasks: [
            [
                "linguagens",
                "Bloco cronometrado de Linguagens",
                "Resolva um conjunto de questões de provas anteriores em tempo controlado."
            ],
            [
                "linguagens",
                "Correção do simulado",
                "Classifique os erros: interpretação, conteúdo, distração, falta de tempo ou escolha de alternativa."
            ],
            [
                "redacao",
                "Revisão da intervenção",
                "Confira se a proposta de intervenção é concreta, detalhada e relacionada ao problema discutido."
            ],
            [
                "exatas",
                "Revisão dos pontos fracos",
                "Retome os assuntos matemáticos com maior número de erros nos exercícios anteriores."
            ],
            [
                "linguagens",
                "Leitura de textos multimodais",
                "Treine a leitura conjunta de texto, imagens, gráficos, tabelas e elementos visuais."
            ]
        ]
    },

    {
        date: "05/11",
        weekday: "QUINTA-FEIRA",
        title: "Consolidar pontos fracos",
        subtitle: "Revisão direcionada ao que mais erra",
        tasks: [
            [
                "linguagens",
                "Revisão dos erros de interpretação",
                "Releia as questões erradas e identifique a evidência textual que sustenta a alternativa correta."
            ],
            [
                "redacao",
                "Treino de introdução e conclusão",
                "Escreva introduções com tese explícita e conclusões com intervenção completa."
            ],
            [
                "exatas",
                "Análise combinatória",
                "Diferencie princípio fundamental da contagem, permutação, arranjo e combinação."
            ],
            [
                "exatas",
                "Exercícios de contagem",
                "Resolva problemas identificando se a ordem importa e se todos os elementos são utilizados."
            ],
            [
                "exatas",
                "Física: mecânica e energia",
                "Revise velocidade média, leis de Newton, trabalho, potência e conservação de energia."
            ],
            [
                "natureza",
                "Biologia: ecologia",
                "Revise cadeias alimentares, fluxo de energia, ciclos biogeoquímicos e impactos ambientais."
            ]
        ]
    },

    {
        date: "06/11",
        weekday: "SEXTA-FEIRA",
        title: "Terceira redação e revisão final",
        subtitle: "Consolidar o que já foi aprendido",
        tasks: [
            [
                "redacao",
                "Terceira redação completa",
                "Faça a última redação completa antes da prova, respeitando o tempo de planejamento e escrita."
            ],
            [
                "redacao",
                "Checklist das cinco competências",
                "Verifique norma-padrão, tema, repertório, organização argumentativa, coesão e intervenção."
            ],
            [
                "linguagens",
                "Questões mistas",
                "Resolva um bloco curto com gêneros textuais, literatura, artes, publicidade e interpretação."
            ],
            [
                "linguagens",
                "Repertórios e conectivos",
                "Revise repertórios que domina e conectivos que utiliza com segurança, sem decorar citações aleatórias."
            ],
            [
                "exatas",
                "Fórmulas essenciais",
                "Revise porcentagem, geometria, estatística, probabilidade, funções e conversões de unidades."
            ],
            [
                "exatas",
                "Caderno de erros",
                "Resolva novamente algumas questões que errou e explique o raciocínio correto."
            ]
        ]
    },

    {
        date: "07/11",
        weekday: "SÁBADO",
        title: "Véspera da prova",
        subtitle: "Revisão leve, organização e descanso",
        tasks: [
            [
                "linguagens",
                "Revisão leve de Linguagens",
                "Leia seu resumo de interpretação, gêneros, figuras de linguagem, literatura e artes."
            ],
            [
                "redacao",
                "Estrutura da redação",
                "Memorize a lógica de organização do texto, não uma redação pronta para reproduzir."
            ],
            [
                "exatas",
                "Revisão de fórmulas",
                "Faça uma leitura breve das fórmulas essenciais, sem iniciar assuntos novos ou extensos."
            ],
            [
                "geral",
                "Documentos e materiais",
                "Separe documento válido, canetas esferográficas pretas de material transparente e o necessário para a prova."
            ],
            [
                "geral",
                "Confirmar local e trajeto",
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
            "Entre com Google para sincronizar seu progresso."
        );
    }
}

function normalizeProgress(value) {
    if (!value || typeof value !== "object") {
        return { completed: [] };
    }

    const completed = Array.isArray(value.completed)
        ? value.completed.filter(item => typeof item === "string")
        : [];

    return {
        completed: [...new Set(completed)]
    };
}

function loadLocalProgress() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return { completed: [] };
        }

        return normalizeProgress(JSON.parse(stored));
    } catch (error) {
        console.error("Erro ao carregar o progresso local:", error);
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
        console.error("Erro ao salvar o progresso local:", error);

        showToast(
            "Não foi possível salvar no navegador. Verifique o armazenamento.",
            "error"
        );
    }
}

function isCompleted(taskId) {
    return progress.completed.includes(taskId);
}

function setCompleted(taskId, completed) {
    const updated = new Set(progress.completed);

    if (completed) {
        updated.add(taskId);
    } else {
        updated.delete(taskId);
    }

    progress.completed = [...updated];

    saveLocalProgress();
    updateProgressDisplay();

    if (currentUser && cloudReady) {
        scheduleCloudSave();
    }
}

function getAllTasks() {
    const regularTasks = days.flatMap((day, dayIndex) =>
        day.tasks.map((task, taskIndex) => ({
            id: `day-${dayIndex}-task-${taskIndex}`,
            dayIndex,
            taskIndex,
            task
        }))
    );

    const laterTasks = afterDays.flatMap((day, dayIndex) =>
        day.tasks.map((task, taskIndex) => ({
            id: `after-${dayIndex}-task-${taskIndex}`,
            dayIndex,
            taskIndex,
            task
        }))
    );

    return [...regularTasks, ...laterTasks];
}

function getTotalTaskCount() {
    return getAllTasks().length;
}

function getCompletedTaskCount() {
    return progress.completed.length;
}


/* =========================================================
   7. RENDERIZAÇÃO DAS TAREFAS
   ========================================================= */

function categoryLabel(category) {
    const labels = {
        linguagens: "LINGUAGENS",
        redacao: "REDAÇÃO",
        exatas: "EXATAS",
        humanas: "HUMANAS",
        natureza: "NATUREZA",
        geral: "GERAL"
    };

    return labels[category] || category.toUpperCase();
}

function createTaskHTML(task, taskId) {
    const [category, title, description] = task;
    const checked = isCompleted(taskId);

    return `
        <label class="task-item">
            <input
                type="checkbox"
                data-task-id="${escapeHTML(taskId)}"
                ${checked ? "checked" : ""}
                aria-label="${escapeHTML(title)}"
            >

            <span class="task-copy">
                <span class="task-title">
                    ${escapeHTML(title)}
                </span>

                <span class="task-description">
                    ${escapeHTML(description)}
                </span>
            </span>

            <span class="day-tag ${escapeHTML(category)}">
                ${escapeHTML(categoryLabel(category))}
            </span>
        </label>
    `;
}

function createDayHTML(day, dayIndex) {
    const completedCount = day.tasks.filter((task, taskIndex) =>
        isCompleted(`day-${dayIndex}-task-${taskIndex}`)
    ).length;

    const completedDay =
        completedCount === day.tasks.length;

    const categories = [
        ...new Set(day.tasks.map(task => task[0]))
    ];

    const hasExatas = day.tasks.some(
        task => task[0] === "exatas"
    );

    const hasFirstDaySubjects = day.tasks.some(
        task => ["linguagens", "redacao", "humanas"].includes(task[0])
    );

    return `
        <article
            class="schedule-day ${completedDay ? "completed" : ""}"
            data-day-index="${dayIndex}"
            data-exatas="${hasExatas}"
            data-primeiro="${hasFirstDaySubjects}"
        >
            <button
                class="day-header"
                type="button"
                aria-expanded="false"
                aria-label="Abrir ${escapeHTML(day.title)}"
            >
                <span class="day-number">
                    ${escapeHTML(day.date)}
                </span>

                <span class="day-heading">
                    <h3>${escapeHTML(day.title)}</h3>
                    <p>
                        ${escapeHTML(day.weekday || day.subtitle || "")}
                    </p>
                </span>

                <span class="day-tags">
                    ${categories.map(category => `
                        <span class="day-tag ${escapeHTML(category)}">
                            ${escapeHTML(categoryLabel(category))}
                        </span>
                    `).join("")}
                </span>

                <span class="day-chevron" aria-hidden="true">
                    ↓
                </span>
            </button>

            <div class="day-content">
                <p class="day-intro">
                    ${escapeHTML(day.subtitle || "Marque cada atividade conforme concluir.")}
                </p>

                <div class="task-list">
                    ${day.tasks.map((task, taskIndex) =>
                        createTaskHTML(
                            task,
                            `day-${dayIndex}-task-${taskIndex}`
                        )
                    ).join("")}
                </div>

                <div class="day-footer">
                    <span>
                        ${day.tasks.length} atividades planejadas
                    </span>

                    <span class="day-completion">
                        ${completedCount}/${day.tasks.length} concluídas
                    </span>
                </div>
            </div>
        </article>
    `;
}

function renderSchedule() {
    if (!scheduleElement) {
        console.error(
            'Elemento "#schedule" não encontrado no index.html.'
        );
        return;
    }

    scheduleElement.innerHTML = days
        .map((day, index) => createDayHTML(day, index))
        .join("");

    applyFilter();
}

function renderAfterDays() {
    if (!afterDaysElement) {
        console.error(
            'Elemento "#afterDays" não encontrado no index.html.'
        );
        return;
    }

    afterDaysElement.innerHTML = afterDays.map((day, dayIndex) => {
        const completedCount = day.tasks.filter((task, taskIndex) =>
            isCompleted(`after-${dayIndex}-task-${taskIndex}`)
        ).length;

        return `
            <div class="after-day">
                <strong>${escapeHTML(day.date)}</strong>
                <span>${escapeHTML(day.title)}</span>
                <span>${completedCount}/${day.tasks.length} tarefas</span>

                <div class="after-task-list">
                    ${day.tasks.map((task, taskIndex) =>
                        createTaskHTML(
                            task,
                            `after-${dayIndex}-task-${taskIndex}`
                        )
                    ).join("")}
                </div>
            </div>
        `;
    }).join("");
}


/* =========================================================
   8. FILTROS
   ========================================================= */

function applyFilter() {
    const cards = $$(".schedule-day");

    cards.forEach(card => {
        let visible = true;

        if (currentFilter === "primeiro") {
            visible = card.dataset.primeiro === "true";
        }

        if (currentFilter === "exatas") {
            visible = card.dataset.exatas === "true";
        }

        card.hidden = !visible;
    });

    $$("[data-filter]").forEach(button => {
        const active = button.dataset.filter === currentFilter;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });
}

function initializeFilters() {
    $$("[data-filter]").forEach(button => {
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter || "todos";
            applyFilter();
        });
    });
}


/* =========================================================
   9. CLIQUES E CHECKBOXES
   ========================================================= */

function initializeScheduleEvents() {
    if (!scheduleElement) return;

    scheduleElement.addEventListener("click", event => {
        const header = event.target.closest(".day-header");

        if (!header) return;

        const card = header.closest(".schedule-day");

        if (!card) return;

        const willOpen = !card.classList.contains("open");

        card.classList.toggle("open", willOpen);
        header.setAttribute("aria-expanded", String(willOpen));
    });

    scheduleElement.addEventListener("change", event => {
        const checkbox = event.target.closest(
            'input[type="checkbox"][data-task-id]'
        );

        if (!checkbox) return;

        setCompleted(
            checkbox.dataset.taskId,
            checkbox.checked
        );

        updateDayCompletion(checkbox);
    });

    if (afterDaysElement) {
        afterDaysElement.addEventListener("change", event => {
            const checkbox = event.target.closest(
                'input[type="checkbox"][data-task-id]'
            );

            if (!checkbox) return;

            setCompleted(
                checkbox.dataset.taskId,
                checkbox.checked
            );

            updateAfterDayCompletion(checkbox);
        });
    }
}

function updateDayCompletion(checkbox) {
    const card = checkbox.closest(".schedule-day");

    if (!card) return;

    const dayIndex = Number(card.dataset.dayIndex);
    const day = days[dayIndex];

    if (!day) return;

    const completedCount = day.tasks.filter((task, taskIndex) =>
        isCompleted(`day-${dayIndex}-task-${taskIndex}`)
    ).length;

    const footer = $(".day-completion", card);

    if (footer) {
        footer.textContent =
            `${completedCount}/${day.tasks.length} concluídas`;
    }

    card.classList.toggle(
        "completed",
        completedCount === day.tasks.length
    );
}

function updateAfterDayCompletion(checkbox) {
    const card = checkbox.closest(".after-day");

    if (!card) return;

    const dayIndex = [...afterDaysElement.children].indexOf(card);
    const day = afterDays[dayIndex];

    if (!day) return;

    const completedCount = day.tasks.filter((task, taskIndex) =>
        isCompleted(`after-${dayIndex}-task-${taskIndex}`)
    ).length;

    const summary = card.querySelector(":scope > span:last-child");

    if (summary) {
        summary.textContent =
            `${completedCount}/${day.tasks.length} tarefas`;
    }
}


/* =========================================================
   10. PROGRESSO GERAL
   ========================================================= */

function updateProgressDisplay() {
    const total = getTotalTaskCount();
    const completed = getCompletedTaskCount();

    const percent = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const remaining = Math.max(0, total - completed);

    if (progressText) {
        progressText.textContent = `${completed} de ${total}`;
    }

    if (progressPercent) {
        progressPercent.textContent = `${percent}%`;
    }

    if (progressFill) {
        progressFill.style.width = `${percent}%`;
        progressFill.setAttribute("role", "progressbar");
        progressFill.setAttribute("aria-valuemin", "0");
        progressFill.setAttribute("aria-valuemax", "100");
        progressFill.setAttribute("aria-valuenow", String(percent));
    }

    if (remainingText) {
        remainingText.textContent = remaining === 1
            ? "1 atividade restante"
            : `${remaining} atividades restantes`;
    }

    updateVisibleDaySummaries();
}

function updateVisibleDaySummaries() {
    $$(".schedule-day").forEach(card => {
        const dayIndex = Number(card.dataset.dayIndex);
        const day = days[dayIndex];

        if (!day) return;

        const completedCount = day.tasks.filter((task, taskIndex) =>
            isCompleted(`day-${dayIndex}-task-${taskIndex}`)
        ).length;

        const footer = $(".day-completion", card);

        if (footer) {
            footer.textContent =
                `${completedCount}/${day.tasks.length} concluídas`;
        }

        card.classList.toggle(
            "completed",
            completedCount === day.tasks.length
        );
    });

    renderAfterDays();
}


/* =========================================================
   11. RESTAURAR E LIMPAR PROGRESSO
   ========================================================= */

async function resetProgress() {
    const confirmed = window.confirm(
        "Deseja apagar todas as atividades concluídas? " +
        "Essa alteração também será sincronizada com o Firebase " +
        "se você estiver conectado."
    );

    if (!confirmed) return;

    progress = { completed: [] };

    saveLocalProgress();

    // Atualiza os checkboxes da lista principal.
    $$('input[type="checkbox"][data-task-id]').forEach(checkbox => {
        checkbox.checked = false;
    });

    renderSchedule();
    renderAfterDays();
    updateProgressDisplay();

    if (currentUser && cloudReady) {
        try {
            await saveCloudProgress();

            showToast("Progresso reiniciado e sincronizado.");
        } catch (error) {
            console.error("Erro ao limpar o progresso na nuvem:", error);

            showToast(
                "Progresso local apagado, mas a nuvem não foi atualizada.",
                "error"
            );
        }
    } else {
        showToast("Progresso reiniciado neste navegador.");
    }
}


/* =========================================================
   12. FIREBASE — CARREGAMENTO
   ========================================================= */

async function initializeFirebase() {
    if (!firebaseConfigured()) {
        setCloudStatus("Progresso salvo neste navegador", false);
        return;
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
            ...authModule,
            ...firestoreModule
        };

        firebaseApp = appModule.initializeApp(firebaseConfig);

        auth = authModule.getAuth(firebaseApp);
        db = firestoreModule.getFirestore(firebaseApp);

        cloudReady = true;

        authModule.onAuthStateChanged(auth, async user => {
            currentUser = user || null;

            updateGoogleButton();

            if (!currentUser) {
                setCloudStatus("Progresso salvo neste navegador", false);
                return;
            }

            setCloudStatus("Sincronizando progresso...", false);

            try {
                await loadCloudProgress();

                setCloudStatus("Sincronizado com a nuvem", true);
            } catch (error) {
                console.error(
                    "Erro ao sincronizar os dados:",
                    error
                );

                setCloudStatus("Erro na sincronização", false);

                showToast(
                    firebaseErrorMessage(error),
                    "error"
                );
            }
        });

        setCloudStatus("Firebase conectado; aguardando login", true);

    } catch (error) {
        console.error("Erro ao iniciar o Firebase:", error);

        cloudReady = false;

        setCloudStatus("Falha na conexão com o Firebase", false);

        showToast(
            "Não foi possível iniciar o Firebase. Confira as credenciais e a conexão.",
            "error"
        );
    }
}


/* =========================================================
   13. FIREBASE — LOGIN E LOGOUT
   ========================================================= */

async function signInWithGoogle() {
    if (!firebaseConfigured()) {
        if (setupModal && typeof setupModal.showModal === "function") {
            setupModal.showModal();
        } else {
            showToast(
                "Configure as credenciais do Firebase no script.js.",
                "error"
            );
        }

        return;
    }

    if (!auth || !cloudModules) {
        showToast(
            "Firebase ainda não está pronto. Tente novamente.",
            "error"
        );

        return;
    }

    try {
        if (currentUser) {
            const shouldSignOut = window.confirm(
                `Deseja sair da conta ${currentUser.email || "Google"}?`
            );

            if (!shouldSignOut) return;

            await cloudModules.signOut(auth);

            currentUser = null;
            updateGoogleButton();

            setCloudStatus("Progresso salvo neste navegador", false);

            showToast("Você saiu da sua conta Google.");
            return;
        }

        const provider = new cloudModules.GoogleAuthProvider();

        await cloudModules.signInWithPopup(auth, provider);

    } catch (error) {
        console.error("Erro no login Google:", error);

        showToast(firebaseErrorMessage(error), "error");
    }
}


/* =========================================================
   14. FIREBASE — CARREGAR PROGRESSO
   ========================================================= */

function getProgressDocumentReference() {
    if (!db || !currentUser || !cloudModules) {
        throw new Error("Firebase, banco ou usuário indisponível.");
    }

    return cloudModules.doc(
        db,
        "users",
        currentUser.uid,
        "progress",
        "enem2026"
    );
}

async function loadCloudProgress() {
    if (!currentUser || !cloudReady || !cloudModules) return;

    const documentReference = getProgressDocumentReference();

    const snapshot = await cloudModules.getDoc(documentReference);

    if (snapshot.exists()) {
        const cloudData = normalizeProgress(snapshot.data());

        // União entre progresso local e remoto:
        // evita perder tarefas concluídas em outro dispositivo.
        progress.completed = [
            ...new Set([
                ...progress.completed,
                ...cloudData.completed
            ])
        ];
    }

    saveLocalProgress();

    isApplyingCloudData = true;

    renderSchedule();
    renderAfterDays();
    updateProgressDisplay();

    isApplyingCloudData = false;

    await saveCloudProgress();
}


/* =========================================================
   15. FIREBASE — SALVAR PROGRESSO
   ========================================================= */

let cloudSaveTimeout = null;

function scheduleCloudSave() {
    if (!currentUser || !cloudReady || isApplyingCloudData) {
        return;
    }

    clearTimeout(cloudSaveTimeout);

    cloudSaveTimeout = setTimeout(async () => {
        try {
            await saveCloudProgress();
            setCloudStatus("Sincronizado com a nuvem", true);
        } catch (error) {
            console.error(
                "Erro ao salvar o progresso na nuvem:",
                error
            );

            setCloudStatus("Erro ao sincronizar", false);

            showToast(
                "O progresso continua salvo localmente, mas a nuvem falhou.",
                "error"
            );
        }
    }, 700);
}

async function saveCloudProgress() {
    if (!currentUser || !cloudReady || !cloudModules) return;

    if (cloudSyncing) {
        return;
    }

    cloudSyncing = true;

    try {
        const documentReference = getProgressDocumentReference();

        await cloudModules.setDoc(
            documentReference,
            {
                completed: progress.completed,
                updatedAt: cloudModules.serverTimestamp(),
                email: currentUser.email || null
            },
            { merge: true }
        );
    } finally {
        cloudSyncing = false;
    }
}


/* =========================================================
   16. ERROS DO FIREBASE
   ========================================================= */

function firebaseErrorMessage(error) {
    const code = error?.code || "";

    const messages = {
        "auth/popup-closed-by-user":
            "A janela de login foi fechada antes da conclusão.",

        "auth/popup-blocked":
            "O navegador bloqueou a janela de login. Permita pop-ups para este site.",

        "auth/unauthorized-domain":
            "Este domínio não está autorizado. Adicione-o em Firebase Authentication > Settings > Authorized domains.",

        "auth/operation-not-allowed":
            "O login Google não está ativado no Firebase Authentication.",

        "auth/network-request-failed":
            "Falha de conexão. Verifique sua internet e tente novamente.",

        "permission-denied":
            "O Firestore recusou o acesso. Confira as regras de segurança do banco.",

        "unavailable":
            "O Firestore está indisponível no momento. Tente novamente."
    };

    return messages[code] ||
        error?.message ||
        "Ocorreu um erro inesperado. Verifique o console do navegador.";
}


/* =========================================================
   17. INICIALIZAÇÃO DOS BOTÕES
   ========================================================= */

function initializeButtons() {
    if (googleSignInButton) {
        googleSignInButton.addEventListener("click", signInWithGoogle);
    }

    if (resetProgressButton) {
        resetProgressButton.addEventListener("click", resetProgress);
    }

    if (closeSetupButton) {
        closeSetupButton.addEventListener("click", () => {
            if (setupModal?.open) {
                setupModal.close();
            }
        });
    }

    if (setupModal) {
        setupModal.addEventListener("click", event => {
            if (event.target === setupModal) {
                setupModal.close();
            }
        });
    }
}


/* =========================================================
   18. VERIFICAÇÃO DE ELEMENTOS HTML
   ========================================================= */

function checkRequiredElements() {
    const requiredElements = [
        ["#schedule", scheduleElement],
        ["#afterDays", afterDaysElement],
        ["#progressText", progressText],
        ["#progressPercent", progressPercent],
        ["#progressFill", progressFill],
        ["#remainingText", remainingText]
    ];

    const missing = requiredElements
        .filter(([, element]) => !element)
        .map(([selector]) => selector);

    if (missing.length > 0) {
        console.warn(
            "Alguns elementos esperados não foram encontrados no HTML:",
            missing.join(", ")
        );

        console.warn(
            "Confira se o index.html corresponde à versão do projeto ENEM Reta Final."
        );
    }
}


/* =========================================================
   19. INICIALIZAÇÃO GERAL
   ========================================================= */

async function initializeApp() {
    checkRequiredElements();

    renderSchedule();
    renderAfterDays();

    initializeFilters();
    initializeScheduleEvents();
    initializeButtons();

    updateProgressDisplay();
    updateGoogleButton();

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


