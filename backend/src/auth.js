import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'pivot-saludcrm-clave-academica-cambiar';
export function createToken(user){return jwt.sign({id:user.id_usuario,email:user.email,rol:user.rol,nombre:user.nombre},SECRET,{expiresIn:'8h'});}
export function authRequired(req,res,next){const [type,token]=(req.headers.authorization||'').split(' ');if(type!=='Bearer'||!token)return res.status(401).json({error:'No autorizado'});try{req.user=jwt.verify(token,SECRET);next();}catch{return res.status(401).json({error:'Sesión inválida o vencida'});}}
export const requireRoles=(...roles)=>(req,res,next)=>roles.includes(req.user.rol)?next():res.status(403).json({error:'No tenés permisos para realizar esta acción'});
