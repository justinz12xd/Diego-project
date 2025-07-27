// auth.js - Sistema de autenticación para Youdemy con Vue

// Credenciales del profesor
const PROFESOR_CREDENCIALES = {
  correo: 'adminprofe12@gmail.com',
  contrasena: 'admin',
  nombre: 'Profesor Administrador',
  rol: 'profesor'
}

// Función para registrar un nuevo usuario
export function registrarUsuario(nombre, correo, contrasena) {
  try {
    // Validaciones básicas
    if (!nombre.trim() || !correo.trim() || !contrasena.trim()) {
      throw new Error('Todos los campos son obligatorios');
    }
    
    if (contrasena.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Verificar si es el correo del profesor
    if (correo.toLowerCase().trim() === PROFESOR_CREDENCIALES.correo) {
      throw new Error('Este correo está reservado para uso administrativo');
    }
    
    // Obtener usuarios existentes
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Verificar si el correo ya existe
    const usuarioExistente = usuarios.find(user => user.correo === correo.toLowerCase().trim());
    if (usuarioExistente) {
      throw new Error('Ya existe un usuario con este correo electrónico');
    }
    
    // Crear nuevo usuario (por defecto es estudiante)
    const nuevoUsuario = {
      id: Date.now(),
      nombre: nombre.trim(),
      correo: correo.toLowerCase().trim(),
      contrasena: contrasena, // En producción, esto debería estar encriptado
      rol: 'estudiante',
      fechaRegistro: new Date().toISOString()
    };
    
    // Agregar usuario al array
    usuarios.push(nuevoUsuario);
    
    // Guardar en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    return { success: true, message: 'Usuario registrado exitosamente' };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return { success: false, message: error.message };
  }
}

// Función para iniciar sesión
export function iniciarSesion(correo, contrasena) {
  try {
    // Validaciones básicas
    if (!correo.trim() || !contrasena.trim()) {
      throw new Error('Por favor completa todos los campos');
    }
    
    const correoNormalizado = correo.toLowerCase().trim();
    
    // Verificar si es el profesor
    if (correoNormalizado === PROFESOR_CREDENCIALES.correo && contrasena === PROFESOR_CREDENCIALES.contrasena) {
      const profesor = {
        id: 'profesor',
        nombre: PROFESOR_CREDENCIALES.nombre,
        correo: PROFESOR_CREDENCIALES.correo,
        rol: PROFESOR_CREDENCIALES.rol
      };
      
      // Guardar sesión del profesor
      localStorage.setItem('usuario', profesor.correo);
      localStorage.setItem('usuarioNombre', profesor.nombre);
      localStorage.setItem('usuarioId', profesor.id);
      localStorage.setItem('usuarioRol', profesor.rol);
      
      return { success: true, message: 'Inicio de sesión exitoso', usuario: profesor };
    }
    
    // Obtener usuarios estudiantes registrados
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Buscar usuario por correo y contraseña
    const usuario = usuarios.find(user => 
      user.correo === correoNormalizado && 
      user.contrasena === contrasena
    );
    
    if (usuario) {
      // Guardar sesión activa
      localStorage.setItem('usuario', usuario.correo);
      localStorage.setItem('usuarioNombre', usuario.nombre);
      localStorage.setItem('usuarioId', usuario.id.toString());
      localStorage.setItem('usuarioRol', usuario.rol || 'estudiante');
      
      return { success: true, message: 'Inicio de sesión exitoso', usuario };
    } else {
      throw new Error('Correo o contraseña incorrectos');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, message: error.message };
  }
}

// Función para cerrar sesión
export function logout() {
  try {
    // Limpiar datos de sesión
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioRol');
    
    return { success: true, message: 'Sesión cerrada exitosamente' };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { success: false, message: 'Error al cerrar sesión' };
  }
}

// Función para verificar si el usuario está autenticado
export function estaAutenticado() {
  return localStorage.getItem('usuario') !== null;
}

// Función para obtener datos del usuario actual
export function obtenerUsuarioActual() {
  if (estaAutenticado()) {
    return {
      correo: localStorage.getItem('usuario'),
      nombre: localStorage.getItem('usuarioNombre'),
      id: localStorage.getItem('usuarioId'),
      rol: localStorage.getItem('usuarioRol') || 'estudiante'
    };
  }
  return null;
}

// Función para verificar si el usuario es profesor
export function esProfesor() {
  const usuario = obtenerUsuarioActual();
  return usuario && usuario.rol === 'profesor';
}

// Función para verificar si el usuario es estudiante
export function esEstudiante() {
  const usuario = obtenerUsuarioActual();
  return usuario && usuario.rol === 'estudiante';
}

// Función para limpiar todos los datos (útil para desarrollo/testing)
export function limpiarDatos() {
  localStorage.clear();
  return { success: true, message: 'Todos los datos han sido eliminados' };
}
