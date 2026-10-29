-- Dossiers de la médiathèque : un niveau, rangés à la main.
-- `media.folder_id` est nullable (« Non classés ») ; supprimer un dossier
-- remet ses fichiers dans les non classés (ON DELETE SET NULL), sans rien
-- effacer.
CREATE TABLE IF NOT EXISTS "media_folders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_folders_order_idx" ON "media_folders" ("sort_order");--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "folder_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_media_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."media_folders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_folder_idx" ON "media" ("folder_id");
