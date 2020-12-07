Curso Docker
============

Conceptos a profundizar
-----------------------
* kinematic
* ngrok
* todas las herramientas CI/CD teoría pura
* shields io --> te dice porcentaje de codigo cubierto por tests

Conceptos
---------
* El docker engine es común entre todos los contenedoreses lo que diferencia entre la eficiencia de tener varias maquinas virtuales ara cada proyecto cada una con su sistema opertativo
* y la necesidad del hipervisor de cada una de las maquinas virtuales (e.g.VMware)
* cada imagen pesa X pues cada container pesará más o menos lo mismo
* docker es portable a cualquier máquina PERO la gestión de los volumenes es distinta sobre todo en entornos windows y esto hay que tenerlo en cuenta
* en windows sólo funciona en el pro 1511 en adelante y se debe activar Hyper-V esto hará que virtualvox deje de funcionar aunque no se borrarán sus datos. si no puedes usar docker machine que al final es usar una maquina virtual en medio que emulará un linux con un virtual vox
* en mac hay también algunos problemas con los volumenes porque /var/temp no es nativo en mac
* cuando ejecutas comandos docker en realidad estas haciendo uso del cli de docker. Importante la configuración para ejecutar sin sudo? docker-compose es otro paquete en linux que tamibén habría que instalar
* en vez de hacer ADD puedes requerir un volumen para vincular con localhost sobre todo para dev no tener que estar volviendo a generar el container a cada cambio
* CMD es la última sentencia en un docker file porque una vez montada la imagen entera y levantado el container ejecuta dichos comandos en el container 
* como acceder al bash del container depende de la imagen si utilizamos una versión de ubunto será el CMD bash pero si usamos un from de node entonces será /bin/bash en node estária ejecutando el comando node bash por ejemplo
* cuando haces build --no-cache la imagen anterior se queda huerfana y pierda la referencia eso es lo que va creando basura
* cuando creas un volumen pero resulta que estas haciendo un composer install en el docker file en la carpeta que vas a hacer binding de volumen, te da error porque no existe en tu local. Porqué? pues porque al levantar el dockerfile crea node_modules pero cuando ya lo levanta al hacer el binding se "sobrescribe" con el binding con la info de tu localhost y se pierden.(confirmado que es así). node_modules debería estar siempre dentro del docker y no en el local, para que quede reflejada en la imagen
* aunque en dev el código se pone en un volumen en la imagen que subas a producción debe estár dentro del contenedor autocontenida
* docker run contenedor <CMD> y docker exec contenerdor <CMD>, el run es para iniciarlo, en el también puedes añadir un -it y un comando adicional para hacerlo interactivo, el exec es para ejecutar un comando en un contendor ya corriendo
* en cada contenedor sólo debe correr una cosa, por eso está el compose
* en las versiones alphine el gestor de paquetes es apk


Dockerfile
----------

* cada instrucción es una capa añadida en la imagen
* la diferencia entre dev/prod es la utilización de volumenes, esto con asteríscos ya que en producción también se pueden requerir volumenes, pero hay que evitarlos
* Dockerfile -> build ->> imagen -> run ->> contenedor
* imagenes tipo x con x la tecnología es la oficial si viene y/x y es el usuarioque ha modificado dicha imagen oficial y puedes ir a mirar qué ha hecho
* cada build le pone un tag y si no cambia el build ya lo tiene (ese trozo de tu imagen por ejemplo) para la próxima ese paso durará menos, por eso hay tantos tags
luego hace los run que se ve que dice RUN en ese tag
* cuando haces expose dentro de un dockerfile expone dicho puerto pero no has hecho una conexión con el localhost para eso tienes que poner -p localhost:dockercontainer en el comando de run y hacer el binding
* ADD coge archivos del localhost a la imagen  


Docker commands
---------------

* docker build . 
* docker images -> ves las imagenes
* docker run -it(interactivo) <IMAGE_ID/TAG> <COMMAND>(por ejemplo bash y te meterías en la cosola de la imagen) pero de esta forma cuando te sales del comando se cae el contenedor
* docker ps -> ve las imagenes que están corriendo, es decir los contenedores.
* docker ps -a --> te muestra todo el historial de los contenedores, los que hubo corriendo con que imagenes etc
* cada vez que haces un run se crea un container con su container id basado, por ejemplo en la misma imagen, gastan espacio
* docker rm <DOCKER_CONTAINER_ID/DOCKER_IMAGE_ID> --> elimina un container por id
* docker build -t <TAG_NAME>:<VERSION> . --no-cache (no usa los tags de imagen que tiene para ese proceso)
* docker run --name <CONTAINER_NAME> <IMAGE_TAG> <COMMAND> --> el container name es la última columna en el ps ya que ponerle id a los containers no es bueno, eso lo gestiona docker como hemos visto crea muchos incluso varios para cada paso de construccion de una imagen final. Ese nombre si no lo pones lo genera con dos palaras aleatorias

 LIMPIEZA cuando terminas
* docker rm <CONTAINER_NAME/CONTAINER_ID/IMAGE_ID/IMAGE_TAG> --> no vale para contenedores corriendo -f(si quieres forzar)
* docker rm -f $(docker ps -aq) -> elimina todo docker containers
* docker rmi <IMAGE_ID> --> sirve para eliminar las imagenes por su id
* docker run --name clase_2_1 clase2:latest
* docker exec -it <CONTAINER_NAME/ID> /bin/bash sobre un contenedor corriendo te mete en la terminal de ese contenedor
* docker rm -f clase_2_1 para parar un container

* docker run --name clase_2_2 -p 3001:s3000 -v /Users/enrikerf/workspace/cursoDocker/C2:/code clase2:latest --> Hemos copiado determinados archivos en el dockerfile pero como al hacer run estamos creando el volumen de nuestro localhost a /code del container ahora cuando creamos o modificamos cosas en nuestro localhost se verán en el /code del container
* docker volume ls --> lista todos los volumenes en docker
* docker run -i -t alpine /bin/sh cuando quieres usar un servicio en un contenedor
* si quiere usar el bash del SO por debajo o lo trae o si es una versión alphine de linux por ejemplo tienes que instalarlo 
    * apk add bash
    * docker run -i -t alpine /bin/bash

Volumenes
---------

* carpeta_localhost:carpeta_contenedor
* docker volume rm <VOLUME_NAME>
* docker volume rm $(docker volume ls -qf dangling=true)
* la etiqueta de primer nivel volume en dockercompose sirve para que se pueda utilizar ese volumen del localhost en varios servicios explicación:

De esta forma relacionas un volumen físico con uno del contendor
```
version: '3'

services: 
    web:
        build: ./cool_app
        ports: 
            - "127.0.0.1:8001:8001"
        links: 
            - postgres:postgres
        command: python manage.py runserver 0.0.0.0:8001
    postgres:
        image: postgres:9.6
        ports: 
            -  "5432:5432"

        env_file: .env
        volumes: 
            - ./pg_data/:/var/lib/postgresql/data/
```

Si no puedes relacionarlo por problemas de permisos, windows, o simplemente no quieres tenerlo en tu local pero tampoco quieres perderlo cuando elimines los contenedores, entonces creas un volumen en el docker del sistema que lo persistirá en localhost (docker como programa) y no se eliminará conn el contenedor a no ser que le digas a docker expresamente que borre ese volumen

```
version: '3'

services: 
    web:
        build: ./cool_app
        ports: 
            - "127.0.0.1:8001:8001"
        links: 
            - postgres:postgres
        command: python manage.py runserver 0.0.0.0:8001
    postgres:
        image: postgres:9.6
        ports: 
            -  "5432:5432"
        env_file: .env
        volumes: 
            - postgres:/var/lib/postgresql/data/
volumes: 
    postgres:
```

de esta forma con 

    docker volume ls

podrás verlo y no se perderá hasta que hagas 

    docker volume prune

lo elimines expresamente

    docker volume rm volume_name volumen_name

o elimines los dandlings y no haya un contenedor relacionado con dicho volumen

    docker volume rm $(docker volume ls -qf dangling=true)

pero claro entonces si lo haces así para prod porque tienes un windows server y quieres guardar en localhost
la información controlada por tí y no por el programa daemon de docker instalado en la máquina entonces

```diff
version: "3"

services:
  web:
    build: ./cool_app
    env_file: .env
    ports:
      - "127.0.0.1:8001:8001"
    links:
      - postgres:postgres
    command: python manage.py runserver 0.0.0.0:8001
  postgres:
    image: postgres:9.6
    env_file: .env
    ports:
      - "5432:5432"
    volumes:
      - postgres:/var/lib/postgresql/data/
      - ./data:/data
-(esto es porque el primer volumen da problemas de permisos (postgres) y con esta carpeta totalmente aparte podemos ejecutar comandos que metan aquí los datos)
volumes: 
  postgres:
```

para ver como está un volumen montado

    docker volume inspect <volume_name>

Networking
-----------

* localhostPort:containerPort --> eso hace accesible públicamente si quieres que solo sea desde una ip entonces tienes que poner 127.0.0.1:localhostPort:containerPort y entonces sólo será accesible desde tu localhost
* docker network rm $( docker network ls | grep "bridge" | awk '/ / { print $1}' )

Environment
-----------

* para nunca poner variables privadas como keys en el dockerfile
* -e VARNAME ó --env-file=/path_to_.env

docker-compose
--------------
* son formato ansible, yml
* el command normalmente será un script que tenga la lógica de qué comandos ejecutará según el entorno
* docker-compose up -d lo pone en modo daemon
* docker-compose stop -> simplemente lo para
* docker-compose down -> elimina todo el contenedor y lo limpia todo
* docker compose te permite levantar solo una de las imagenes de los servicios definidos de la siguiente forma
    * docker-compose up <nombre del servicio>
    * docker-compose stop <nombre del servicio> también te permite parar uno en concreto
* con entrypoint en vez de command la diferencia es que no se puede sobreescribir el comando ( no lo entiendo muy bien )
* con control z puedes hacer detach de la consola a un docker-compose up que on le has puesto -d
* restart always es util en producción pero no en local!!
* es interesante crear un volumen con la configuración de las bases de datos no solo la base de datos en sí para que también este versionado y en el repo?
* si haces un link <nombreEnElServicioQueMira>:<NombreDelServicioAMirar> y luego ejecutas un bash en el servicio que mira puedes hacer ping de <nombreEnElServicioQueMira> ya que has hecho conexión


Gitlab pipelines
================

stages y jobs
-------------

cada stage puede tener varios jobs, los stages son los pasos hasta deploy y los jobs puedes ponerle el tag only para que solo se ejecute si es un despliege en una rama concreta


