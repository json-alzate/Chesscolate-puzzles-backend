# Imagen base de Node.js
FROM node:18

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Instalar dependencias de la aplicación
# El asterisco se usa para asegurarse de que tanto package.json como package-lock.json sean copiados
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Construir el proyecto si es necesario
# RUN npm run build

# Exponer el puerto en el que corre tu aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD [ "node", "dist/main" ]
