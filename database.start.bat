docker stop postgresql
docker rm postgresql
docker run --name postgresql -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v /data:/var/lib/postgresql/data -d postgres
npx prisma migrate dev