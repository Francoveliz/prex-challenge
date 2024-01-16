export async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('miBaseDeDatos', 2); // Incrementa la versión para realizar cambios

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Crea el almacén de objetos para usuarios
      const userStore = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });

      // Crea el índice 'email' si no existe
      if (!userStore.indexNames.contains('email')) {
        userStore.createIndex('email', 'email', { unique: true });
      }

      // Create the object store for archivos linked to the ID of the user
      const fileStore = db.createObjectStore('archivos', { keyPath: 'id', autoIncrement: true });

      // Crea el almacén de objetos para archivos vinculados al ID del usuario
      fileStore.createIndex('creatorId', 'creatorId', { unique: false });
 
      // Create the 'sharedWithMe' index on the 'archivos' object store
      if (!fileStore.indexNames.contains('sharedWith')) {
        fileStore.createIndex('sharedWith', 'sharedWith', { multiEntry: true });
      }

    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function addUser(user) {
  const db = await openDatabase();
  const transaction = db.transaction(['usuarios'], 'readwrite');
  const store = transaction.objectStore('usuarios');
  const userId = await store.add(user);
  return userId;
}

export async function isEmailTaken(email) {
  const db = await openDatabase();
  const transaction = db.transaction(['usuarios'], 'readonly');
  const store = transaction.objectStore('usuarios');

  return new Promise((resolve, reject) => {
    // Verificar si el índice 'email' existe antes de acceder a él
    if (store.indexNames.contains('email')) {
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = (event) => {
        const user = event.target.result;
        resolve(!!user); // Devolver true si el usuario existe, false si no
      };

      request.onerror = (event) => {
        console.error('Error al intentar obtener el usuario por correo electrónico:', event.target.error);
        reject(false); // Manejar el error devolviendo false
      };
    } else {
      // Manejar la situación si el índice 'email' no existe
      console.error('El índice "email" no existe en la base de datos.');
      resolve(false); // Devolver false si el índice no existe
    }
  });
}

export async function loginUser(email, password) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['usuarios'], 'readonly');
    const store = transaction.objectStore('usuarios');
    const index = store.index('email');
    const request = index.get(email);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const user = event.target.result;

        if (user && user.password === password) {
          resolve(user);
        } else {
          // Usuario no encontrado o contraseña incorrecta
          resolve(null);
        }
      };

      request.onerror = (event) => {
        console.error('Error al intentar obtener el usuario por correo electrónico:', event.target.error);
        reject(null);
      };
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addFile({creatorId, file, fileName, fileSize, createdDate,creatorName, creatorLastName,type}) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['archivos'], 'readwrite');
    const fileStore = transaction.objectStore('archivos');

    const fileData = {
      creatorId,
      file,  
      fileName ,
      fileSize,
      createdDate,
      creatorName,
      creatorLastName,
      sharedWith:[],
      type,
    };

    const fileId = await fileStore.add(fileData);
    return fileId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteFileById(fileId) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['archivos'], 'readwrite');
    const store = transaction.objectStore('archivos');

    // Eliminar el archivo por su ID
    const request = store.delete(fileId);

    request.onsuccess = () => {
      console.log('Archivo eliminado exitosamente');
    };

    request.onerror = (event) => {
      console.error('Error al eliminar el archivo', event.target.error);
    };
  } catch (error) {
    console.error('Error en la operación de eliminación', error);
  }
}


export async function getFilesCreatedByUser(userId) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['archivos'], 'readonly');
    const store = transaction.objectStore('archivos');

    // Obtener todos los archivos donde el creator_id coincide con userId
    const index = store.index('creatorId');
    const request = index.openCursor(IDBKeyRange.only(userId));

    const files = [];

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          files.push(cursor.value);
          cursor.continue();
        } else {
          resolve(files);
        }
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function shareFile({ fileId, userIdToAdd, currentUserId }) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['archivos', 'usuarios'], 'readwrite');
    const filesStore = transaction.objectStore('archivos');
    const usersStore = transaction.objectStore('usuarios');

    // Verificar si el archivo y los usuarios existen
    const fileRequest = filesStore.get(fileId);
    const userToAddRequest = usersStore.get(userIdToAdd);
    const currentUserRequest = usersStore.get(currentUserId);

    // Obtener los valores reales de las solicitudes
    const [file, userToAdd, currentUser] = await Promise.all([
      getRequestValue(fileRequest),
      getRequestValue(userToAddRequest),
      getRequestValue(currentUserRequest),
    ]);

    if (!file || !userToAdd || !currentUser) {
      throw new Error('Archivo o usuarios no encontrados.');
    }

    // Verificar si el usuario actual es el creador del archivo
    if (Number(file.creatorId) !== Number(currentUserId)) {
      throw new Error('Solo el creador del archivo puede compartirlo.');
    }

    // Verificar si el usuario ya tiene acceso al archivo
    if (file.sharedWith.includes(userIdToAdd)) {
      throw new Error('El usuario ya tiene acceso al archivo.');
    }

    // Compartir el archivo con el nuevo usuario
    file.sharedWith.push(userIdToAdd);
    await filesStore.put(file);

    // Agregar el archivo compartido a la lista de archivos compartidos del nuevo usuario
    if (!userToAdd.sharedWithMe) {
      userToAdd.sharedWithMe = [];
    }
    userToAdd.sharedWithMe.push(fileId);
    await usersStore.put(userToAdd);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Función auxiliar para obtener el valor de una solicitud IDBRequest
function getRequestValue(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}


export async function getAllUsers(excludeUserId) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['usuarios'], 'readonly');
    const usersStore = transaction.objectStore('usuarios');

    const cursorRequest = usersStore.openCursor();
    const allUsers = [];

    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        const user = cursor.value;

        if (user.id !== excludeUserId) {
          allUsers.push({ id: user.id, name: user.name, lastName: user.lastName });
        }

        cursor.continue();
      }
    };

    return new Promise(resolve => {
      transaction.oncomplete = function () {
        resolve(allUsers);
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSharedFilesToUser(userId) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['archivos'], 'readonly');
    const filesStore = transaction.objectStore('archivos');
    const index = filesStore.index('sharedWithMe');
    // Use IDBKeyRange.only to match the userId
    const cursorRequest = index.openCursor(IDBKeyRange.only(userId));

    return new Promise((resolve, reject) => {
      const sharedWithMe = [];

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const file = cursor.value;
          sharedWithMe.push(file);
          cursor.continue();
        } else {
          // When there are no more files, resolve the promise with the list of shared files
          resolve(sharedWithMe);
        }
      };

      cursorRequest.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

