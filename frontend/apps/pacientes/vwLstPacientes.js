document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var listagem = document.getElementById('pacientesListagem');
    var alertBox = document.getElementById('pacientesAlert');
    
    if (!listagem) {
        return;
    }

    var servidor = listagem.dataset.servidor;

    configurarOperacoesPacientes(alertBox);
    carregarPacientes(servidor, alertBox);
});

async function carregarPacientes(servidor, alertBox) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        var response = await fetch(servidor + '/getAllPacientes');

        if (!response.ok) {
            throw new Error('Nao foi possivel carregar a lista de pacientes.');
        }

        var data = await response.json();

        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta invalida do servidor backend.');
        }

        inicializarTabelaPacientes(data.registro);
    } catch (error) {
        exibirErro(alertBox, error.message || 'Erro ao carregar pacientes.');
        inicializarTabelaPacientes([]);
    }
}

function inicializarTabelaPacientes(pacientes) {
    new DataTable('#tblPacientes', {
        data: pacientes,
        columns: [
            { data: 'pacienteid', defaultContent: '' },
            { data: 'nome', defaultContent: '' },
            {
                data: 'cpf',
                defaultContent: '',
                render: function(data, type, row) {
                    if (!data) {
                        return '';
                    }

                    if (type !== 'display') {
                        return data;
                    }

                    var cpf = String(data).replace(/\D/g, '');

                    if (cpf.length !== 11) {
                        return escaparHtml(data);
                    }

                    return cpf.replace(
                        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
                        '$1.$2.$3-$4'
                    );
                }
            },
            { data: 'email', defaultContent: '' },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    if (type !== 'display') {
                        return '';
                    }
                    var pacienteId = escaparHtml(row.pacienteid || '');
                    return [
                    '<div class="btn-group btn-group-sm" role="group" aria-label="Operacoes do paciente">',
                    '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-pacienteid="' + pacienteId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
                    '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-pacienteid="' + pacienteId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
                    '<button class="btn btn-outline-danger" type="button" data-action="remover" data-pacienteid="' + pacienteId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
                    '</div>'
                    ].join('');
                }
            }
        ],
        language: {
            emptyTable: 'Nenhum paciente cadastrado.',
            info: 'Mostrando _START_ ate _END_ de _TOTAL_ registros',
            infoEmpty: 'Mostrando 0 ate 0 de 0 registros',
            infoFiltered: '(filtrado de _MAX_ registros no total)',
            lengthMenu: 'Mostrar _MENU_ registros',
            loadingRecords: 'Carregando...',
            processing: 'Processando...',
            search: 'Pesquisar:',
            zeroRecords: 'Nenhum registro encontrado',
            paginate: {
                first: 'Primeiro',
                last: 'Ultimo',
                next: 'Proximo',
                previous: 'Anterior'
            }
        }
    });
}

function configurarOperacoesPacientes(alertBox) {
    var tabela = document.getElementById('tblPacientes');

    if (!tabela) {
        return;
    }

    tabela.addEventListener('click', function(event) {
        var botao = event.target.closest('button[data-action][data-pacienteid]');

        if (!botao) {
            return;
        }

        var action = botao.dataset.action;
        var pacienteId = botao.dataset.pacienteid;

        if (action === 'visualizar') {
            window.location.href = '/pacientes/form?oper=Re&pacienteId=' + encodeURIComponent(pacienteId); 
            return;
        }

        if (action === 'atualizar') {
            window.location.href = '/pacientes/form?oper=Up&pacienteId=' + encodeURIComponent(pacienteId); 
            return;
        }


        if (action === 'remover') {
            if (confirm('Confirma a remocao do paciente ' + pacienteId + '?')) {
                window.location.href = '/pacientes/form?oper=De&pacienteId=' + encodeURIComponent(pacienteId);
            }
        }

    });
}

function exibirAviso(alertBox, mensagem) {
    if (!alertBox) {
        return;
    }

    alertBox.textContent = mensagem;
    alertBox.classList.remove('alert-danger');
    alertBox.classList.add('alert-info');
    alertBox.classList.remove('d-none');
}

function escaparHtml(valor) {
    return String(valor).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function exibirErro(alertBox, mensagem) {
    if (!alertBox) {
        return;
    }
    
    alertBox.textContent = mensagem;
    alertBox.classList.remove('alert-info');
    alertBox.classList.add('alert-danger');
    alertBox.classList.remove('d-none');
}
