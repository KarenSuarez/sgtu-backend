# Usa una imagen base de Node.js ligera
FROM node:20-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json (si existe)
# Esto permite que Docker use la capa de caché para las dependencias,
# acelerando futuras construcciones si los package.json no cambian.
COPY package*.json ./

# Instala las dependencias del proyecto
# Usa --omit=dev para no instalar dependencias de desarrollo en producción
RUN npm install

# Copia el resto del código de la aplicación al contenedor
COPY . .

# Expone el puerto en el que la aplicación Express escucha
EXPOSE 3000

# Comando para iniciar la aplicación cuando el contenedor se ejecute
# Asume que tu archivo principal es src/app.js
CMD [ "node", "src/app.js" ]

# Si usas nodemon para desarrollo, podrías tener un CMD condicional
# CMD [ "npm", "run", "dev" ] si tienes un script 'dev' en package.json
# Para producción, 'node src/app.js' es suficiente.