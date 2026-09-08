-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."doctors" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "specialization" VARCHAR(100) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "age" INTEGER,
    "gender" VARCHAR(20),
    "diagnosis" TEXT,
    "contact_number" VARCHAR(30),
    "doctor_id" INTEGER,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_patients_last_name" ON "public"."patients"("last_name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "unique_patient_contact" ON "public"."patients"("contact_number" ASC);

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "fk_patient_doctor" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

