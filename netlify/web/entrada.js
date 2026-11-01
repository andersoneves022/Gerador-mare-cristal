// Entrada da versão estática para o Netlify: o mesmo aplicativo, sem framework de servidor.
import '../../legacy/css/tokens.css';
import '../../legacy/css/base.css';
import '../../legacy/css/shell.css';
import '../../legacy/css/painel.css';
import '../../legacy/css/biblioteca.css';
import '../../legacy/css/editor.css';
import '../../legacy/css/exportar.css';
import { iniciarApp } from '../../legacy/main.js';

iniciarApp(document.getElementById('app'));
