document.addEventListener('DOMContentLoaded', function() {
    if (!dw3IsLogged()) {
        return;
    }

    var form = document.getElementById('frmConsultas');

    if (!form) {
        return;
    }

    var oper = form.dataset.oper;
    var servidor = form.dataset.servidor;
    var btnInserir = document.getElementById('btnInserirConsulta');
    var btnAtualizar = document.getElementById('btnAtualizarConsulta');

    inicializarSelectPacientes();

    if (oper === 'Cr') {
        dw3OcultarBotao('btnAtualizarConsulta'); 
        dw3OcultarBotao('btnRemoverConsulta');
        carregarPacientesToConsultas(servidor);
    }

    if (oper === 'Re') { 
        dw3OcultarBotao('btnInserirConsulta');
        dw3OcultarBotao('btnAtualizarConsulta');
        dw3OcultarBotao('btnRemoverConsulta');
        vwGetConsultaByID();
    }

    if (oper === 'Up') {
        dw3OcultarBotao('btnInserirConsulta');
        dw3OcultarBotao('btnRemoverConsulta');
        vwGetConsultaByID();
        btnAtualizar.disabled = !(vwGetConsultaByID());
        btnAtualizar.addEventListener('click', function() {
            vwUpdateConsulta();
        });
    }

    if (oper === 'De') { 
        dw3OcultarBotao('btnInserirConsulta');
        dw3OcultarBotao('btnAtualizarConsulta');
        var btnRemover = document.getElementById('btnRemoverConsulta'); 
        vwGetConsultaByID();
        btnRemover.disabled = !(vwGetConsultaByID());
        btnRemover.addEventListener('click', function() {
            vwDeleteConsulta();
        });
    }


    if (btnInserir) {
        btnInserir.addEventListener('click', function() {
            vwInsertConsulta();
        });
    }
});

// Aqui é inicializado o componente Select2.js em branco
function inicializarSelectPacientes() {
    $('#pacienteid').select2({
        theme: 'bootstrap-5',
        placeholder: 'Selecione um paciente',
        width: '100%'
    });
}

// Aqui é preenchido o componente Select2 com os pacientes disponíveis
async function carregarPacientesToConsultas(servidor) {
    try {
        if (!servidor) {
            throw new Error('Endereço do servidor backend nao configurado.');
        }

        var response = await fetch(servidor + '/getPacientesToConsultas', {
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Não foi possivel carregar as consultas.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessão expirada. Faca login novamente.');
        }
        if (data.status !== 'ok' || !Array.isArray(data.registro)) {
            throw new Error('Resposta invalida do servidor backend.');
        }

        preencherSelectPacientes(data.registro);

        return true;
    } catch (error) {
        alert(error.message || 'Erro ao carregar pacientes.');
        return false; 
    }
}

function preencherSelectPacientes(pacientes) {
    var pacienteSelect = document.getElementById('pacienteid');

    if (!pacienteSelect) {
        return;
    }

    pacienteSelect.innerHTML = '<option value="">Selecione um paciente</option>';
    pacientes.forEach(function(paciente) {
        var option = document.createElement('option');
        option.value = paciente.pacienteid;
        option.textContent = paciente.nome;
        pacienteSelect.appendChild(option);
    });

    $('#pacienteid').trigger('change');
}

async function vwGetConsultaByID() {
  var form = document.getElementById('frmConsultas');

  try {
    var parametros = new URLSearchParams(window.location.search);
    var consultaId = parametros.get('consultaId');
    var servidor = form.dataset.servidor;

    if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
      throw new Error('ID da consulta inválido.');
    }

    if (!servidor) {
      throw new Error('Endereco do servidor backend nao configurado.');
    }

    var response = await fetch(servidor + '/getConsultaByID/' + encodeURIComponent(consultaId), {
      headers: dw3MontarHeadersAutenticacao({
        'content-type': 'application/json'
      })
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel carregar a consulta.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
    }

    if (data.status !== 'ok') {
      throw new Error('Resposta inválida do servidor backend.');
    }

    var consulta = Array.isArray(data.registro) ? data.registro[0] : data.registro;

    if (!consulta) {
      throw new Error('Consulta não encontrada.');
    }

    document.getElementById('consultaid').value = consulta.consultaid;
    document.getElementById('descricao').value = consulta.descricao ?? '';
    document.getElementById('valor').value = consulta.valor ?? '';
    document.getElementById('dataconsulta').value = consulta.dataconsulta ? consulta.dataconsulta.slice(0, 10) : '';
    document.getElementById('datarealizacao').value = consulta.datarealizacao ? consulta.datarealizacao.slice(0, 10) : '';
    document.getElementById('status').checked = consulta.status === true;
    document.getElementById('deleted').value = String(consulta.deleted === true);

    if (!(await carregarPacientesToConsultas(servidor))) {
      return false;
    }
    $('#pacienteid').val(consulta.pacienteid).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar consulta.');
    return false;
  }
}

async function vwInsertConsulta() {
    var form = document.getElementById('frmConsultas');
    var btnInserir = document.getElementById('btnInserirConsulta');

    try {
        if (!form.reportValidity()) {
            return;
        }

        var servidor = form.dataset.servidor;
        if (!servidor) {
            throw new Error('Endereco do servidor backend nao configurado.');
        }

        if (btnInserir) {
            btnInserir.disabled = true;
        }

        var response = await fetch(servidor + '/insertConsulta', {
            method: 'POST',
            headers: dw3MontarHeadersAutenticacao({'content-type': 'application/json'}),
            body: JSON.stringify(montarConsultaDoFormulario())
        });

        if (!response.ok) {
            throw new Error('Nao foi possível inserir a consulta.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faça login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Não foi possível inserir a consulta.');
        }

        window.location.href = '/consultas';
    } catch (error) {
        alert(error.message || 'Erro ao inserir consulta.');
    } finally {
        if (btnInserir) {
            btnInserir.disabled = false;
        }
    }
}

async function vwUpdateConsulta() {
    var form = document.getElementById('frmConsultas');
    var btnAtualizar = document.getElementById('btnAtualizarConsulta');
    
    if (btnAtualizar.disabled || !form.reportValidity()) {
        return;
    }

    try {
        var consultaId = new URLSearchParams(window.location.search).get('consultaId');
        var servidor = form.dataset.servidor;

        if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
            throw new Error('ID da consulta inválido.');
        }

        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnAtualizar.disabled = true;

        var consulta = montarConsultaDoFormulario();
        consulta.valor = Number(consulta.valor);
        consulta.pacienteid = Number(consulta.pacienteid);

        var response = await fetch(servidor + '/updateConsulta/' + encodeURIComponent(consultaId), {
            method: 'PUT',
            headers: dw3MontarHeadersAutenticacao({
                'content-type': 'application/json'
            }),
            body: JSON.stringify(consulta)
        });

        if (!response.ok) {
            throw new Error('Nao foi possivel atualizar a consulta.');
        }

        var data = await response.json();
        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel atualizar a consulta.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhuma consulta foi atualizada.');
        }
        alert('Consulta atualizada com sucesso.');
    } catch (error) {
        alert(error.message || 'Erro ao atualizar consulta.');
    } finally {
        btnAtualizar.disabled = false;
    }
}

async function vwDeleteConsulta() {
    var form = document.getElementById('frmConsultas');
    var btnRemover = document.getElementById('btnRemoverConsulta');

    if (btnRemover.disabled) {
        return;
    }
    if (!window.confirm('Confirma a remoção desta consulta?')) {
        return;
    }

    try {
        var consultaId = document.getElementById('consultaid').value;
        var servidor = form.dataset.servidor;

        if (!consultaId || !/^\d+$/.test(consultaId) || Number(consultaId) <= 0) {
            throw new Error('ID da consulta inválido.');
        }
        if (!servidor) {
            throw new Error('Endereço do servidor backend não configurado.');
        }

        btnRemover.disabled = true;

        var response = await fetch(servidor + '/deleteConsulta/' + encodeURIComponent(consultaId), {
            method: 'DELETE',
            headers: dw3MontarHeadersAutenticacao()
        });

        if (!response.ok) {
            throw new Error('Nao foi possivel remover a consulta.');
        }

        var data = await response.json();

        if (data.auth === false) {
            throw new Error(data.message || 'Sessao expirada. Faca login novamente.');
        }
        if (data.status !== 'ok') {
            throw new Error(data.status || 'Nao foi possivel remover a consulta.');
        }
        if (data.linhasAfetadas !== 1) {
            throw new Error('Nenhuma consulta foi removida.');
        }

        window.location.href = '/consultas';
    } catch (error) {
        alert(error.message || 'Erro ao remover consulta.');
    } finally {
        btnRemover.disabled = false;
    }
}

function montarConsultaDoFormulario() {
    return {
        descricao: document.getElementById('descricao').value,
        valor: document.getElementById('valor').value,
        dataconsulta: document.getElementById('dataconsulta').value,
        datarealizacao: document.getElementById('datarealizacao').value,
        status: document.getElementById('status').checked,
        pacienteid: document.getElementById('pacienteid').value,
        deleted: document.getElementById('deleted').value === 'true'
    };
}