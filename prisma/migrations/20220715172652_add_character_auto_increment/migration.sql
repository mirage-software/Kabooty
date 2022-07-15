-- AlterTable
CREATE SEQUENCE "animecharacter_id_seq";
ALTER TABLE "AnimeCharacter" ALTER COLUMN "id" SET DEFAULT nextval('animecharacter_id_seq');
ALTER SEQUENCE "animecharacter_id_seq" RESTART WITH 101800 OWNED BY "AnimeCharacter"."id";
