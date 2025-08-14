import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1755096512563 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "username" VARCHAR(30) UNIQUE NOT NULL,
        "about" VARCHAR(200) DEFAULT 'Пока ничего не рассказал о себе',
        "avatar" VARCHAR(255) DEFAULT 'https://i.pravatar.cc/300',
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "wishes" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" VARCHAR(250) NOT NULL,
        "link" VARCHAR(255) NOT NULL,
        "image" VARCHAR(255) NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "raised" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "description" VARCHAR(1024) NOT NULL,
        "copied" INTEGER NOT NULL DEFAULT 0,
        "ownerId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "wishlists" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" VARCHAR(250) NOT NULL,
        "description" VARCHAR(1500),
        "image" VARCHAR(255),
        "ownerId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "offers" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "amount" DECIMAL(10,2) NOT NULL,
        "hidden" BOOLEAN NOT NULL DEFAULT false,
        "userId" INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
        "itemId" INTEGER REFERENCES "wishes"(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
    CREATE TABLE "wishlists_items_wishes" (
      "wishlistsId" INTEGER NOT NULL REFERENCES "wishlists"(id) ON DELETE CASCADE,
      "wishesId" INTEGER NOT NULL REFERENCES "wishes"(id) ON DELETE CASCADE,
      PRIMARY KEY ("wishlistsId", "wishesId")
    );
  `);

    await queryRunner.query(
      `CREATE INDEX "IDX_user_username" ON "users" ("username")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wish_owner" ON "wishes" ("ownerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wishlist_owner" ON "wishlists" ("ownerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_user" ON "offers" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_item" ON "offers" ("itemId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wishlist_item" ON "wishlists_items_wishes" ("wishlistsId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wishlist_wish" ON "wishlists_items_wishes" ("wishesId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlists_items_wishes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "offers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wishlists"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wishes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
