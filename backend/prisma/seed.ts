import * as bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('Iniciando seed...');

  await prisma.historico_chamado.deleteMany();
  await prisma.chamado.deleteMany();
  await prisma.pessoa.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.prioridade.deleteMany();
  await prisma.setor.deleteMany();

  const hashedSenha = await bcrypt.hash('senha123', 10);

  const setorFinanceiro = await prisma.setor.create({ data: { titulo_setor: 'Financeiro' } });
  const setorRH = await prisma.setor.create({ data: { titulo_setor: 'Recursos Humanos' } });
  const setorComercial = await prisma.setor.create({ data: { titulo_setor: 'Comercial' } });
  const setorTecnologia = await prisma.setor.create({ data: { titulo_setor: 'Tecnologia' } });

  const prioridadeBaixa = await prisma.prioridade.create({ data: { titulo: 'Baixa' } });
  const prioridadeMedia = await prisma.prioridade.create({ data: { titulo: 'Media' } });
  const prioridadeAlta = await prisma.prioridade.create({ data: { titulo: 'Alta' } });

  const catHardware = await prisma.categoria.create({ data: { titulo: 'Manutencao de Hardware' } });
  const catSoftware = await prisma.categoria.create({ data: { titulo: 'Instalacao de Software' } });
  const catRede = await prisma.categoria.create({ data: { titulo: 'Problemas de Rede e Internet' } });
  const catAcesso = await prisma.categoria.create({ data: { titulo: 'Controle de Acessos e Senhas' } });

  const joao = await prisma.pessoa.create({
    data: {
      nome_completo: 'Joao da Silva',
      cpf: '111.111.111-11',
      email: 'joao.silva@empresa.com',
      senha: hashedSenha,
      cargo: 'USUARIO',
      telefone: '11999999991',
      setor_id: setorFinanceiro.id,
    },
  });

  const maria = await prisma.pessoa.create({
    data: {
      nome_completo: 'Maria Oliveira',
      cpf: '222.222.222-22',
      email: 'maria.oliveira@empresa.com',
      senha: hashedSenha,
      cargo: 'USUARIO',
      telefone: '11999999992',
      setor_id: setorRH.id,
    },
  });

  const pedro = await prisma.pessoa.create({
    data: {
      nome_completo: 'Pedro Santos',
      cpf: '333.333.333-33',
      email: 'pedro.santos@empresa.com',
      senha: hashedSenha,
      cargo: 'USUARIO',
      telefone: '11999999993',
      setor_id: setorComercial.id,
    },
  });

  const carlos = await prisma.pessoa.create({
    data: {
      nome_completo: 'Carlos Eduardo',
      cpf: '444.444.444-44',
      email: 'carlos.tech@empresa.com',
      senha: hashedSenha,
      cargo: 'TECNICO',
      setor_id: setorTecnologia.id,
    },
  });

  const ana = await prisma.pessoa.create({
    data: {
      nome_completo: 'Ana Lucia',
      cpf: '555.555.555-55',
      email: 'ana.rede@empresa.com',
      senha: hashedSenha,
      cargo: 'TECNICO',
      setor_id: setorTecnologia.id,
    },
  });

  const marcos = await prisma.pessoa.create({
    data: {
      nome_completo: 'Marcos Vinicius',
      cpf: '666.666.666-66',
      email: 'marcos.dev@empresa.com',
      senha: hashedSenha,
      cargo: 'TECNICO',
      setor_id: setorTecnologia.id,
    },
  });

  const chamado1 = await prisma.chamado.create({
    data: {
      titulo: 'Computador nao liga',
      descricao: 'Desktop nao da sinal de vida ao apertar o botao power.',
      prioridade_id: prioridadeAlta.id,
      status: 'EM_ATENDIMENTO',
      usuario_id: joao.id,
      tecnico_id: carlos.id,
      categoria_id: catHardware.id,
    },
  });

  const chamado2 = await prisma.chamado.create({
    data: {
      titulo: 'Sem acesso a internet',
      descricao: 'Computador conectado no cabo, mas nao navega.',
      prioridade_id: prioridadeMedia.id,
      status: 'RESOLVIDO',
      solucao_problema: 'Cabo de rede substituido e teste de ping com sucesso.',
      usuario_id: maria.id,
      tecnico_id: ana.id,
      categoria_id: catRede.id,
    },
  });

  const chamado3 = await prisma.chamado.create({
    data: {
      titulo: 'Esqueci senha do ERP',
      descricao: 'Nao consigo acessar o sistema financeiro desde ontem.',
      prioridade_id: prioridadeMedia.id,
      status: 'ABERTO',
      usuario_id: joao.id,
      categoria_id: catAcesso.id,
    },
  });

  const chamado4 = await prisma.chamado.create({
    data: {
      titulo: 'Instalacao do Pacote Office',
      descricao: 'Preciso do Office instalado na maquina nova do Comercial.',
      prioridade_id: prioridadeBaixa.id,
      status: 'FECHADO',
      solucao_problema: 'Pacote Office 365 instalado e ativado.',
      usuario_id: pedro.id,
      tecnico_id: marcos.id,
      categoria_id: catSoftware.id,
    },
  });

  await prisma.historico_chamado.createMany({
    data: [
      { chamado_id: chamado1.id, pessoa_id: joao.id, novo_status: 'ABERTO' },
      { chamado_id: chamado1.id, pessoa_id: carlos.id, novo_status: 'EM_ATENDIMENTO' },
      { chamado_id: chamado2.id, pessoa_id: maria.id, novo_status: 'ABERTO' },
      { chamado_id: chamado2.id, pessoa_id: ana.id, novo_status: 'EM_ATENDIMENTO' },
      { chamado_id: chamado2.id, pessoa_id: ana.id, novo_status: 'RESOLVIDO' },
      { chamado_id: chamado3.id, pessoa_id: joao.id, novo_status: 'ABERTO' },
      { chamado_id: chamado4.id, pessoa_id: pedro.id, novo_status: 'ABERTO' },
      { chamado_id: chamado4.id, pessoa_id: marcos.id, novo_status: 'EM_ATENDIMENTO' },
      { chamado_id: chamado4.id, pessoa_id: marcos.id, novo_status: 'RESOLVIDO' },
      { chamado_id: chamado4.id, pessoa_id: pedro.id, novo_status: 'FECHADO' },
    ],
  });

  console.log('Seed finalizado com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });