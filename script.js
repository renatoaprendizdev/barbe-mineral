/* =========================================================
   TECH BARBER
   SCRIPT.JS

   Sistema de agendamento
   HTML + CSS + JavaScript
   Sem banco de dados

   ATENÇÃO:
   Altere o número do WhatsApp abaixo.
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const CONFIG = {

    whatsapp: "5527998662834",

    storageKey: "techBarberAgendamentos",

    horarios: [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00"
    ]

};


/* =========================================================
   ELEMENTOS
========================================================= */

const bookingForm =
    document.getElementById("bookingForm");

const bookingDate =
    document.getElementById("bookingDate");

const scheduleGrid =
    document.getElementById("scheduleGrid");

const addressArea =
    document.getElementById("addressArea");

const clientAddress =
    document.getElementById("clientAddress");

const reference =
    document.getElementById("reference");

const clientName =
    document.getElementById("clientName");

const clientPhone =
    document.getElementById("clientPhone");

const observation =
    document.getElementById("observation");

const summaryAttendance =
    document.getElementById("summaryAttendance");

const summaryService =
    document.getElementById("summaryService");

const summaryDate =
    document.getElementById("summaryDate");

const summaryTime =
    document.getElementById("summaryTime");

const summaryPrice =
    document.getElementById("summaryPrice");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   ESTADO DO AGENDAMENTO
========================================================= */

let selectedTime = "";

let selectedService = null;

let selectedAttendance = "barbearia";


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    definirDataMinima();

    criarHorarios();

    configurarAtendimento();

    configurarServicos();

    configurarData();

    configurarTelefone();

    atualizarResumo();

    atualizarAno();

});


/* =========================================================
   DATA MÍNIMA
========================================================= */

function definirDataMinima() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");

    const dataAtual =
        `${ano}-${mes}-${dia}`;

    bookingDate.min = dataAtual;

    if (!bookingDate.value) {

        bookingDate.value = dataAtual;

    }

}


/* =========================================================
   CRIAR HORÁRIOS
========================================================= */

function criarHorarios() {

    scheduleGrid.innerHTML = "";

    CONFIG.horarios.forEach(horario => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className = "time-button";

        button.dataset.time = horario;

        button.textContent = horario;

        button.addEventListener(
            "click",
            () => selecionarHorario(button)
        );

        scheduleGrid.appendChild(button);

    });

    atualizarDisponibilidade();

}


/* =========================================================
   SELECIONAR HORÁRIO
========================================================= */

function selecionarHorario(button) {

    if (button.disabled) {

        return;

    }

    document
        .querySelectorAll(".time-button")
        .forEach(item => {

            item.classList.remove("selected");

        });

    button.classList.add("selected");

    selectedTime =
        button.dataset.time;

    atualizarResumo();

}


/* =========================================================
   ATENDIMENTO
========================================================= */

function configurarAtendimento() {

    const opcoes =
        document.querySelectorAll(
            'input[name="atendimento"]'
        );

    opcoes.forEach(opcao => {

        opcao.addEventListener(
            "change",
            () => {

                selectedAttendance =
                    opcao.value;

                atualizarCardsAtendimento();

                controlarEndereco();

                atualizarPrecos();

                atualizarResumo();

            }
        );

    });

    atualizarCardsAtendimento();

    controlarEndereco();

}


/* =========================================================
   CARDS DE ATENDIMENTO
========================================================= */

function atualizarCardsAtendimento() {

    const cards =
        document.querySelectorAll(
            ".attendance-card"
        );

    cards.forEach(card => {

        const radio =
            card.querySelector(
                'input[name="atendimento"]'
            );

        card.classList.toggle(
            "active",
            radio.checked
        );

    });

}


/* =========================================================
   ENDEREÇO DOMICILIAR
========================================================= */

function controlarEndereco() {

    if (selectedAttendance === "domicilio") {

        addressArea.classList.remove("hidden");

        clientAddress.required = true;

    } else {

        addressArea.classList.add("hidden");

        clientAddress.required = false;

        clientAddress.value = "";

        reference.value = "";

    }

}


/* =========================================================
   SERVIÇOS
========================================================= */

function configurarServicos() {

    const servicos =
        document.querySelectorAll(
            'input[name="servico"]'
        );

    servicos.forEach(servico => {

        servico.addEventListener(
            "change",
            () => {

                selectedService = servico;

                atualizarPrecos();

                atualizarResumo();

            }
        );

    });

}


/* =========================================================
   ATUALIZAR PREÇOS DOS SERVIÇOS
========================================================= */

function atualizarPrecos() {

    const servicos =
        document.querySelectorAll(
            ".service-card"
        );

    servicos.forEach(card => {

        const input =
            card.querySelector(
                'input[name="servico"]'
            );

        const priceElement =
            card.querySelector(
                ".service-price"
            );

        if (!input || !priceElement) {

            return;

        }

        const precoBarbearia =
            Number(
                input.dataset.barbearia
            );

        const precoDomicilio =
            Number(
                input.dataset.domicilio
            );

        const preco =
            selectedAttendance === "domicilio"
                ? precoDomicilio
                : precoBarbearia;

        priceElement.textContent =
            formatarMoeda(preco);

    });

}


/* =========================================================
   DATA
========================================================= */

function configurarData() {

    bookingDate.addEventListener(
        "change",
        () => {

            selectedTime = "";

            document
                .querySelectorAll(".time-button")
                .forEach(button => {

                    button.classList.remove(
                        "selected"
                    );

                });

            atualizarDisponibilidade();

            atualizarResumo();

        }
    );

}


/* =========================================================
   VERIFICAR HORÁRIOS JÁ AGENDADOS
========================================================= */

function obterAgendamentos() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.storageKey
            );

        if (!dados) {

            return [];

        }

        const agendamentos =
            JSON.parse(dados);

        return Array.isArray(agendamentos)
            ? agendamentos
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar agendamentos:",
            erro
        );

        return [];

    }

}


/* =========================================================
   SALVAR AGENDAMENTO
========================================================= */

function salvarAgendamento(agendamento) {

    const agendamentos =
        obterAgendamentos();

    agendamentos.push(agendamento);

    localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(agendamentos)
    );

}


/* =========================================================
   VERIFICAR SE HORÁRIO ESTÁ OCUPADO
========================================================= */

function horarioOcupado(data, horario) {

    const agendamentos =
        obterAgendamentos();

    return agendamentos.some(
        agendamento => {

            return (
                agendamento.data === data &&
                agendamento.horario === horario
            );

        }
    );

}


/* =========================================================
   ATUALIZAR DISPONIBILIDADE
========================================================= */

function atualizarDisponibilidade() {

    const dataSelecionada =
        bookingDate.value;

    const botoes =
        document.querySelectorAll(
            ".time-button"
        );

    if (!dataSelecionada) {

        botoes.forEach(button => {

            button.disabled = true;

            button.classList.add(
                "unavailable"
            );

        });

        return;

    }

    botoes.forEach(button => {

        const horario =
            button.dataset.time;

        const ocupado =
            horarioOcupado(
                dataSelecionada,
                horario
            );

        const horarioPassado =
            verificarHorarioPassado(
                dataSelecionada,
                horario
            );

        if (ocupado || horarioPassado) {

            button.disabled = true;

            button.classList.add(
                "unavailable"
            );

            button.classList.remove(
                "selected"
            );

            if (selectedTime === horario) {

                selectedTime = "";

            }

        } else {

            button.disabled = false;

            button.classList.remove(
                "unavailable"
            );

        }

    });

}


/* =========================================================
   VERIFICAR HORÁRIO PASSADO
========================================================= */

function verificarHorarioPassado(
    data,
    horario
) {

    if (!data) {

        return true;

    }

    const agora = new Date();

    const hoje =
        formatarDataParaInput(agora);

    if (data !== hoje) {

        return false;

    }

    const [hora, minuto] =
        horario.split(":");

    const horarioSelecionado =
        new Date();

    horarioSelecionado.setHours(
        Number(hora),
        Number(minuto),
        0,
        0
    );

    return horarioSelecionado <= agora;

}


/* =========================================================
   FORMATAR DATA PARA INPUT
========================================================= */

function formatarDataParaInput(data) {

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


/* =========================================================
   FORMATAR DATA PARA EXIBIÇÃO
========================================================= */

function formatarData(data) {

    if (!data) {

        return "--";

    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {

        return data;

    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/* =========================================================
   FORMATAR MOEDA
========================================================= */

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   OBTER SERVIÇO SELECIONADO
========================================================= */

function obterServicoSelecionado() {

    const servico =
        document.querySelector(
            'input[name="servico"]:checked'
        );

    return servico || null;

}


/* =========================================================
   OBTER PREÇO ATUAL
========================================================= */

function obterPrecoAtual() {

    const servico =
        obterServicoSelecionado();

    if (!servico) {

        return 0;

    }

    if (selectedAttendance === "domicilio") {

        return Number(
            servico.dataset.domicilio
        );

    }

    return Number(
        servico.dataset.barbearia
    );

}


/* =========================================================
   ATUALIZAR RESUMO
========================================================= */

function atualizarResumo() {

    const servico =
        obterServicoSelecionado();

    const atendimento =
        selectedAttendance === "domicilio"
            ? "Em domicílio"
            : "Na barbearia";

    summaryAttendance.textContent =
        atendimento;

    if (servico) {

        summaryService.textContent =
            servico.value;

    } else {

        summaryService.textContent =
            "Não selecionado";

    }

    summaryDate.textContent =
        formatarData(
            bookingDate.value
        );

    summaryTime.textContent =
        selectedTime || "--";

    summaryPrice.textContent =
        formatarMoeda(
            obterPrecoAtual()
        );

}


/* =========================================================
   MÁSCARA WHATSAPP
========================================================= */

function configurarTelefone() {

    clientPhone.addEventListener(
        "input",
        () => {

            let valor =
                clientPhone.value
                    .replace(/\D/g, "");

            valor =
                valor.substring(0, 11);

            if (valor.length <= 10) {

                valor =
                    valor.replace(
                        /^(\d{2})(\d)/,
                        "($1) $2"
                    );

                valor =
                    valor.replace(
                        /(\d{4})(\d)/,
                        "$1-$2"
                    );

            } else {

                valor =
                    valor.replace(
                        /^(\d{2})(\d)/,
                        "($1) $2"
                    );

                valor =
                    valor.replace(
                        /(\d{5})(\d)/,
                        "$1-$2"
                    );

            }

            clientPhone.value =
                valor;

        }
    );

}


/* =========================================================
   VALIDAR TELEFONE
========================================================= */

function telefoneValido() {

    const numeros =
        clientPhone.value
            .replace(/\D/g, "");

    return (
        numeros.length === 10 ||
        numeros.length === 11
    );

}


/* =========================================================
   VALIDAR FORMULÁRIO
========================================================= */

function validarAgendamento() {

    const servico =
        obterServicoSelecionado();

    if (!servico) {

        alert(
            "Escolha um serviço antes de continuar."
        );

        return false;

    }

    if (!bookingDate.value) {

        alert(
            "Escolha a data do atendimento."
        );

        bookingDate.focus();

        return false;

    }

    if (!selectedTime) {

        alert(
            "Escolha um horário disponível."
        );

        return false;

    }

    if (!clientName.value.trim()) {

        alert(
            "Digite seu nome completo."
        );

        clientName.focus();

        return false;

    }

    if (!telefoneValido()) {

        alert(
            "Digite um número de WhatsApp válido."
        );

        clientPhone.focus();

        return false;

    }

    if (
        selectedAttendance === "domicilio" &&
        !clientAddress.value.trim()
    ) {

        alert(
            "Digite o endereço para o atendimento em domicílio."
        );

        clientAddress.focus();

        return false;

    }

    if (
        horarioOcupado(
            bookingDate.value,
            selectedTime
        )
    ) {

        alert(
            "Esse horário acabou de ser reservado. Escolha outro horário."
        );

        atualizarDisponibilidade();

        return false;

    }

    return true;

}


/* =========================================================
   CRIAR MENSAGEM DO WHATSAPP
========================================================= */

function criarMensagemWhatsApp() {

    const servico =
        obterServicoSelecionado();

    const preco =
        obterPrecoAtual();

    const atendimento =
        selectedAttendance === "domicilio"
            ? "Em domicílio"
            : "Na barbearia";

    let mensagem = "";

    mensagem +=
        "✂️ *NOVO AGENDAMENTO - TECH BARBER*";

    mensagem += "\n\n";

    mensagem +=
        "👤 *Cliente:* " +
        clientName.value.trim();

    mensagem += "\n";

    mensagem +=
        "📱 *WhatsApp:* " +
        clientPhone.value.trim();

    mensagem += "\n\n";

    mensagem +=
        "📌 *ATENDIMENTO*";

    mensagem += "\n";

    mensagem +=
        "Tipo: " +
        atendimento;

    mensagem += "\n\n";

    mensagem +=
        "✂️ *SERVIÇO*";

    mensagem += "\n";

    mensagem +=
        "Serviço: " +
        servico.value;

    mensagem += "\n";

    mensagem +=
        "💰 Valor: " +
        formatarMoeda(preco);

    mensagem += "\n\n";

    mensagem +=
        "📅 *DATA E HORÁRIO*";

    mensagem += "\n";

    mensagem +=
        "Data: " +
        formatarData(
            bookingDate.value
        );

    mensagem += "\n";

    mensagem +=
        "Horário: " +
        selectedTime;

    if (
        selectedAttendance === "domicilio"
    ) {

        mensagem += "\n\n";

        mensagem +=
            "🏠 *ENDEREÇO*";

        mensagem += "\n";

        mensagem +=
            clientAddress.value.trim();

        if (reference.value.trim()) {

            mensagem += "\n";

            mensagem +=
                "Referência: " +
                reference.value.trim();

        }

    }

    if (observation.value.trim()) {

        mensagem += "\n\n";

        mensagem +=
            "📝 *OBSERVAÇÕES*";

        mensagem += "\n";

        mensagem +=
            observation.value.trim();

    }

    mensagem += "\n\n";

    mensagem +=
        "⏳ Aguardo a confirmação do meu agendamento.";

    return mensagem;

}


/* =========================================================
   ENVIAR PARA WHATSAPP
========================================================= */

function enviarWhatsApp() {

    const mensagem =
        criarMensagemWhatsApp();

    const url =
        "https://wa.me/" +
        CONFIG.whatsapp +
        "?text=" +
        encodeURIComponent(mensagem);

    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   CONFIRMAR E SALVAR AGENDAMENTO
========================================================= */

function confirmarAgendamento() {

    const servico =
        obterServicoSelecionado();

    const preco =
        obterPrecoAtual();

    const agendamento = {

        id:
            Date.now(),

        cliente:
            clientName.value.trim(),

        telefone:
            clientPhone.value.trim(),

        atendimento:
            selectedAttendance,

        servico:
            servico.value,

        preco:
            preco,

        data:
            bookingDate.value,

        horario:
            selectedTime,

        endereco:
            selectedAttendance === "domicilio"
                ? clientAddress.value.trim()
                : "",

        referencia:
            selectedAttendance === "domicilio"
                ? reference.value.trim()
                : "",

        observacao:
            observation.value.trim(),

        criadoEm:
            new Date().toISOString()

    };

    salvarAgendamento(
        agendamento
    );

}


/* =========================================================
   SUBMIT DO FORMULÁRIO
========================================================= */

bookingForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        if (!validarAgendamento()) {

            return;

        }

        confirmarAgendamento();

        enviarWhatsApp();

        bloquearHorarioSelecionado();

        atualizarResumo();

        mostrarConfirmacao();

    }
);


/* =========================================================
   BLOQUEAR HORÁRIO SELECIONADO
========================================================= */

function bloquearHorarioSelecionado() {

    const botao =
        document.querySelector(
            `.time-button[data-time="${selectedTime}"]`
        );

    if (!botao) {

        return;

    }

    botao.disabled = true;

    botao.classList.remove(
        "selected"
    );

    botao.classList.add(
        "unavailable"
    );

    selectedTime = "";

}


/* =========================================================
   MENSAGEM DE CONFIRMAÇÃO
========================================================= */

function mostrarConfirmacao() {

    const status =
        document.querySelector(
            ".summary-status"
        );

    if (status) {

        status.textContent =
            "ENVIADO";

        status.style.color =
            "var(--primary)";

        status.style.borderColor =
            "rgba(0, 229, 160, 0.3)";

        status.style.background =
            "rgba(0, 229, 160, 0.05)";

    }

}


/* =========================================================
   ATUALIZAR ANO
========================================================= */

function atualizarAno() {

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }

}


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA DOS HORÁRIOS
========================================================= */

setInterval(
    () => {

        atualizarDisponibilidade();

    },
    60000
);


/* =========================================================
   LIMPEZA DE AGENDAMENTOS ANTIGOS
========================================================= */

function limparAgendamentosAntigos() {

    const agendamentos =
        obterAgendamentos();

    if (!agendamentos.length) {

        return;

    }

    const hoje =
        formatarDataParaInput(
            new Date()
        );

    const atualizados =
        agendamentos.filter(
            agendamento => {

                return agendamento.data >= hoje;

            }
        );

    localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify(atualizados)
    );

}


/* =========================================================
   EXECUTAR LIMPEZA
========================================================= */

limparAgendamentosAntigos();