import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'saludcrm.db');

export const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
console.log(`Base de datos persistente: ${dbPath}`);

db.exec(`
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('ADMINISTRADOR','ASESOR','RESPONSABLE_COMERCIAL')),
  activo INTEGER NOT NULL DEFAULT 1,
  fecha_alta TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS origen_comercial (
  id_origen INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS motivo_perdida (
  id_motivo INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS tipo_actividad (
  id_tipo_actividad INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS empresa (
  id_empresa INTEGER PRIMARY KEY AUTOINCREMENT,
  razon_social TEXT NOT NULL,
  cuit TEXT,
  industria TEXT,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  sitio_web TEXT,
  estado TEXT NOT NULL DEFAULT 'POTENCIAL',
  origen TEXT,
  observaciones TEXT,
  id_responsable INTEGER NOT NULL,
  fecha_alta TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_responsable) REFERENCES usuario(id_usuario)
);
CREATE TABLE IF NOT EXISTS contacto (
  id_contacto INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  documento TEXT,
  cargo TEXT,
  email TEXT,
  telefono TEXT,
  estado TEXT NOT NULL DEFAULT 'POTENCIAL',
  origen TEXT,
  observaciones TEXT,
  id_empresa INTEGER,
  id_responsable INTEGER NOT NULL,
  fecha_alta TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
  FOREIGN KEY (id_responsable) REFERENCES usuario(id_usuario)
);
CREATE TABLE IF NOT EXISTS prestadora (
  id_prestadora INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS plan_salud (
  id_plan INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  tipo_cobertura TEXT,
  modalidad TEXT,
  descripcion TEXT,
  precio_referencia REAL,
  activo INTEGER NOT NULL DEFAULT 1,
  id_prestadora INTEGER NOT NULL,
  FOREIGN KEY (id_prestadora) REFERENCES prestadora(id_prestadora)
);
CREATE TABLE IF NOT EXISTS etapa (
  id_etapa INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  orden INTEGER NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'ABIERTA' CHECK(tipo IN ('ABIERTA','GANADA','PERDIDA')),
  activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS oportunidad (
  id_oportunidad INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  id_empresa INTEGER,
  id_contacto INTEGER,
  id_responsable INTEGER NOT NULL,
  id_plan INTEGER NOT NULL,
  id_etapa INTEGER NOT NULL,
  valor_estimado REAL,
  fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_estimada_cierre TEXT,
  origen TEXT,
  estado TEXT NOT NULL DEFAULT 'ABIERTA',
  observaciones TEXT,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
  FOREIGN KEY (id_contacto) REFERENCES contacto(id_contacto),
  FOREIGN KEY (id_responsable) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_plan) REFERENCES plan_salud(id_plan),
  FOREIGN KEY (id_etapa) REFERENCES etapa(id_etapa),
  CHECK (id_empresa IS NOT NULL OR id_contacto IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS actividad (
  id_actividad INTEGER PRIMARY KEY AUTOINCREMENT,
  id_tipo_actividad INTEGER NOT NULL,
  fecha_hora TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario INTEGER NOT NULL,
  id_empresa INTEGER,
  id_contacto INTEGER,
  id_oportunidad INTEGER,
  descripcion TEXT NOT NULL,
  resultado TEXT,
  FOREIGN KEY (id_tipo_actividad) REFERENCES tipo_actividad(id_tipo_actividad),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
  FOREIGN KEY (id_contacto) REFERENCES contacto(id_contacto),
  FOREIGN KEY (id_oportunidad) REFERENCES oportunidad(id_oportunidad),
  CHECK (id_empresa IS NOT NULL OR id_contacto IS NOT NULL OR id_oportunidad IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS historial_etapa (
  id_historial INTEGER PRIMARY KEY AUTOINCREMENT,
  id_oportunidad INTEGER NOT NULL,
  id_etapa_anterior INTEGER,
  id_etapa_nueva INTEGER NOT NULL,
  fecha_hora TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario INTEGER NOT NULL,
  observacion TEXT,
  FOREIGN KEY (id_oportunidad) REFERENCES oportunidad(id_oportunidad),
  FOREIGN KEY (id_etapa_anterior) REFERENCES etapa(id_etapa),
  FOREIGN KEY (id_etapa_nueva) REFERENCES etapa(id_etapa),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
`);

function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
ensureColumn('oportunidad','fecha_cierre','TEXT');
ensureColumn('oportunidad','valor_final','REAL');
ensureColumn('oportunidad','id_motivo_perdida','INTEGER REFERENCES motivo_perdida(id_motivo)');
ensureColumn('oportunidad','fecha_ultima_modificacion','TEXT');

function seed() {
  if (!db.prepare('SELECT 1 FROM usuario WHERE lower(email)=lower(?)').get('admin@saludcrm.com')) {
    db.prepare(`INSERT INTO usuario(nombre,apellido,email,password_hash,rol,activo) VALUES(?,?,?,?,?,1)`)
      .run('Admin','Pivot','admin@saludcrm.com',bcrypt.hashSync('Admin123!',10),'ADMINISTRADOR');
  }
  db.prepare("UPDATE usuario SET apellido='Pivot' WHERE lower(email)=lower(?) AND nombre='Admin'").run('admin@saludcrm.com');

  const usuariosDemo = [
    ['Sofía','Martínez','asesor@saludcrm.com','Asesor123!','ASESOR'],
    ['Martín','López','responsable@saludcrm.com','Responsable123!','RESPONSABLE_COMERCIAL']
  ];
  for (const [n,a,e,p,r] of usuariosDemo) {
    if (!db.prepare('SELECT 1 FROM usuario WHERE lower(email)=lower(?)').get(e)) {
      db.prepare('INSERT INTO usuario(nombre,apellido,email,password_hash,rol,activo) VALUES(?,?,?,?,?,1)').run(n,a,e,bcrypt.hashSync(p,10),r);
    }
  }

  const etapas = [
    ['Consulta recibida',1,'ABIERTA'],['Contactado',2,'ABIERTA'],['Necesidad relevada',3,'ABIERTA'],
    ['Cotización',4,'ABIERTA'],['Documentación',5,'ABIERTA'],['Solicitud de alta',6,'ABIERTA'],
    ['Ganada',7,'GANADA'],['Perdida',8,'PERDIDA']
  ];
  for (const e of etapas) db.prepare('INSERT OR IGNORE INTO etapa(nombre,orden,tipo) VALUES(?,?,?)').run(...e);

  for (const x of ['Sitio web','Redes sociales','Publicidad','Recomendación','Evento','Prospección comercial','Cliente existente'])
    db.prepare('INSERT OR IGNORE INTO origen_comercial(nombre) VALUES(?)').run(x);
  for (const x of ['Precio','Falta de presupuesto','Elección de un competidor','Plan inadecuado','Falta de respuesta','Decisión postergada','Cobertura insuficiente'])
    db.prepare('INSERT OR IGNORE INTO motivo_perdida(nombre) VALUES(?)').run(x);
  for (const x of ['Llamada','Correo electrónico','Mensaje','Reunión presencial','Reunión virtual','Demostración','Envío de propuesta','Nota interna','Otro'])
    db.prepare('INSERT OR IGNORE INTO tipo_actividad(nombre) VALUES(?)').run(x);

  const prestadoras = [['SaludPlus','Prestadora ficticia para datos académicos'],['MedCare','Prestadora ficticia para datos académicos'],['Bienestar Salud','Prestadora ficticia para datos académicos']];
  for (const [n,d] of prestadoras) db.prepare('INSERT OR IGNORE INTO prestadora(nombre,descripcion) VALUES(?,?)').run(n,d);
  if (db.prepare('SELECT COUNT(*) c FROM plan_salud').get().c === 0) {
    const ids = Object.fromEntries(db.prepare('SELECT id_prestadora,nombre FROM prestadora').all().map(x=>[x.nombre,x.id_prestadora]));
    const ins = db.prepare('INSERT INTO plan_salud(nombre,tipo_cobertura,modalidad,descripcion,precio_referencia,id_prestadora) VALUES(?,?,?,?,?,?)');
    ins.run('Plan Esencial 200','Cobertura general','INDIVIDUAL','Plan individual de cobertura general.',80000,ids['SaludPlus']);
    ins.run('Plan Familiar 300','Cobertura ampliada','FAMILIAR','Plan orientado a grupos familiares.',150000,ids['SaludPlus']);
    ins.run('Plan Integral 400','Cobertura integral','INDIVIDUAL','Plan individual con cobertura ampliada.',120000,ids['MedCare']);
    ins.run('Plan Empresa 500','Cobertura corporativa','CORPORATIVA','Plan orientado a empresas y grupos.',220000,ids['Bienestar Salud']);
  }

  // Crea historial inicial para oportunidades preexistentes, sin duplicarlo.
  const missing = db.prepare(`SELECT o.id_oportunidad,o.id_etapa FROM oportunidad o WHERE NOT EXISTS(SELECT 1 FROM historial_etapa h WHERE h.id_oportunidad=o.id_oportunidad)`).all();
  const admin = db.prepare("SELECT id_usuario FROM usuario WHERE lower(email)='admin@saludcrm.com'").get();
  for (const o of missing) db.prepare('INSERT INTO historial_etapa(id_oportunidad,id_etapa_anterior,id_etapa_nueva,id_usuario,observacion) VALUES(?,NULL,?,?,?)').run(o.id_oportunidad,o.id_etapa,admin.id_usuario,'Etapa inicial migrada');
}
seed();
