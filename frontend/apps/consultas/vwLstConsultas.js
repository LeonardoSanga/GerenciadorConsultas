document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var listagem = document.getElementById('consultasListagem');
    var alertBox = document.getElementById('consultasAlert');
    
    if (!listagem) {
        return;
    }

    var servidor = listagem.dataset.servidor;

    configurarOperacoesConsultas(alertBox);
    carregarConsultas(servidor, alertBox);
});

async function carregarConsultas(servidor, alertBox) {
    try {
        if (!servidor) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }

        var response = await fetch(servidor + '/getAllConsultas');

        if (!response.ok) {
            throw new Error('Nao foi possivel carregar a lista de consultas.');
        }

        var data = await response.json();

        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta inválida do servidor backend.');
        }

        inicializarTabelaConsultas(data.registro);
    } catch (error) {
        exibirErro(alertBox, error.message || 'Erro ao carregar consultas.');
        inicializarTabelaConsultas([]);
    }
}

function inicializarTabelaConsultas(consultas) {
    new DataTable('#tblConsultas', {
        data: consultas,
        columns: [
            { data: 'consultaid', defaultContent: '' },
            { data: 'descricao', defaultContent: '' },
            {
                data: 'valor',
                defaultContent: '',
                render: function(data) {
                    if (data === null || data === undefined || data === '') {
                        return '';
                    }
                    return Number(data).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    });
                }
            },
            {
                data: 'dataconsulta',
                defaultContent: '',
                render: function(data) {
                    if (!data) {
                        return '';
                    }
                    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
                }
            },
            {
                data: 'datarealizacao',
                defaultContent: '',
                render: function(data) {
                    if (!data) {
                        return '';
                    }
                    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
                }
            },
            {
                data: 'status',
                defaultContent: '',
                render: function(data) {
                    return data === true ? '<i class="bi bi-hand-thumbs-up-fill text-success"></i>' : '<i class="bi bi-hand-thumbs-down-fill text-danger"></i>';
                }
            },
            { data: 'nome', defaultContent: '' },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    if (type !== 'display') {
                        return '';
                    }
                    var consultaId = escaparHtml(row.consultaid || '');
                    return [
                    '<div class="btn-group btn-group-sm" role="group" aria-label="Operacoes da consulta">',
                    '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-consultaid="' + consultaId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
                    '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-consultaid="' + consultaId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
                    '<button class="btn btn-outline-danger" type="button" data-action="remover" data-consultaid="' + consultaId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
                    '</div>'
                    ].join('');
                }
            }
        ],
        language: {
            emptyTable: 'Nenhuma consulta cadastrado.',
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

function configurarOperacoesConsultas(alertBox) {
    var tabela = document.getElementById('tblConsultas');

    if (!tabela) {
        return;
    }

    tabela.addEventListener('click', function(event) {
        var botao = event.target.closest('button[data-action][data-consultaid]');

        if (!botao) {
            return;
        }

        var action = botao.dataset.action;
        var consultaId = botao.dataset.consultaid;

        if (action === 'visualizar') {
            window.location.href = '/consultas/form?oper=Re&consultaId=' + encodeURIComponent(consultaId); 
            return;
        }

        if (action === 'atualizar') {
            window.location.href = '/consultas/form?oper=Up&consultaId=' + encodeURIComponent(consultaId);
            return;
        }


        if (action === 'remover') {
            if (confirm('Confirma a remoção da consulta ' + consultaId + '?')) {
                window.location.href = '/consultas/form?oper=De&consultaId=' + encodeURIComponent(consultaId);
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
