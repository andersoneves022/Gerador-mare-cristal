// Entrada da versão estática para o Netlify: o mesmo aplicativo, sem framework de servidor.
import '../../src/legacy/css/tokens.css';
import '../../src/legacy/css/base.css';
import '../../src/legacy/css/shell.css';
import '../../src/legacy/css/painel.css';
import '../../src/legacy/css/biblioteca.css';
import '../../src/legacy/css/editor.css';
import '../../src/legacy/css/exportar.css';
import { iniciarApp } from '../../src/legacy/main.js';

iniciarApp(document.getElementById('app'));
