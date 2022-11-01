docker stop postgresql || true &&
docker rm postgresql || true &&
docker run --name postgresql -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v /data:/var/lib/postgresql/data -d postgres:14 &&
npx prisma migrate dev