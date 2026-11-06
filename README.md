# Minhas tarefas

Lista de tarefas web inspirada no Google Tasks, feita com HTML, CSS e JavaScript puro.

## Executar

1. Extraia o arquivo ZIP.
2. Abra `index.html` em um navegador atualizado.
3. Não é necessário instalar pacotes nem ter internet.

Alternativa: dentro da pasta, execute `python -m http.server 8000` e abra `http://localhost:8000`.

## Recursos

- Criar e excluir tarefas.
- Marcar como concluída e reabrir.
- Abas separadas para pendentes e concluídas.
- Prioridade alta, média ou baixa.
- Reordenação por arrastar e soltar, ou pelas setas.
- Salvamento automático da lista, ordem, prioridade e status.

## Decisões

- Os dados ficam no `localStorage` do navegador e não são enviados para servidores. Não há sincronização entre dispositivos.
- A virada do dia é aplicada quando o aplicativo é aberto/recarregado em uma data local diferente: tarefas concluídas voltam a pendentes. Não há execução em segundo plano com o navegador fechado.
- Prioridade é visual e não reorganiza automaticamente a lista: a ordem manual escolhida pelo usuário é respeitada.
- Para manter a versão inicial enxuta, o nome de uma tarefa não pode ser editado depois de criada; exclua e crie novamente para corrigir.
- “Limpar concluídas” exclui permanentemente todas as tarefas da aba Concluídas.

## Estrutura

- `index.html`: estrutura da página.
- `styles.css`: layout e aparência responsiva.
- `app.js`: funcionalidades e armazenamento local.
