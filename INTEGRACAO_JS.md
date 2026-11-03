# Integração HTML/CSS com JavaScript

Esta branch contém a interface nos arquivos `index.html` e `index.css`, ambos na **raiz do repositório**.
O `script.js` deve ser implementado ou conectado pela equipe responsável por JS.

## IDs e ações previstas

- `#newClientBtn`: ao clicar, chamar `document.getElementById('clientDialog').showModal()` e limpar o formulário.
- `#closeClientDialog`: ao clicar, chamar `document.getElementById('clientDialog').close()`.
- `#clientForm`: tratar o envio, validar os campos e salvar/atualizar o cliente. O formulário usa `novalidate`, portanto **a validação deve ser implementada no JS**.
- `#clientId`: identificador do cliente durante a edição; `#submitBtn` e `#cancelEditBtn` controlam as ações.
- `#titulo-form`: atualizar o título quando estiver editando um cliente.
- `#clientTableBody`: inserir linhas conforme o **exemplo comentado dentro do HTML**. Não é necessário programar a abertura do `<details>`; o navegador faz isso.
- `.btn-edit`: abrir `#clientDialog` com os dados do cliente. `.btn-delete`: abrir `#confirmDialog` para confirmar exclusão.
- `#confirmCancel` e `#confirmDelete`: fechar/cancelar ou confirmar a exclusão.
- `#searchInput`: filtrar clientes por nome ou CPF.
- `#clientCount`: atualizar a contagem. `#emptyState`: ocultar quando houver registros e mostrar quando a lista estiver vazia.
- `#toast`: apresentar mensagens e alternar classes `success` e `error`, removendo o atributo `hidden` durante a exibição.
- `#logo-placeholder` e `#logo-imagem`: mostrar a imagem personalizada no lugar do texto; validar formato e tamanho antes de armazená-la. O recurso é opcional e depende de criar um modo de envio de arquivo.

## Observações

- Verificar se existe **apenas um** elemento `<tbody id="clientTableBody">` no HTML. IDs duplicados devem ser removidos antes de integrar o JavaScript.
- A cliente fictícia **Maria Oliveira** fica apenas em comentário como referência, não aparece nos dados reais.
- O cabeçalho da tabela tem duas colunas (**Nome** e **Ações**). Cada registro usa uma célula `colspan="2"` para permitir expandir CPF, e-mail e telefone pela largura inteira.
- O CSS está separado e referenciado como `index.css`; mantenha `index.html` e `index.css` juntos na raiz do repositório.
- O HTML referencia `script.js` no mesmo diretório, na raiz do repositório. Se a equipe colocar o JS em outra pasta, ajuste o atributo `src` da tag `<script>` no HTML.
- Como CPF e outros dados pessoais não ficam protegidos por criptografia no LocalStorage, use **dados fictícios nos testes acadêmicos**. Um CRM real exigiria outra arquitetura e controles de segurança.
