import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { describeDbError, jsonError, readJson, requireAdmin } from "@/lib/api/http";
import type { Permission } from "@/lib/auth";
import {
  DataError,
  createBrand,
  createCategory,
  createGalleryItem,
  createProduct,
  deleteBrand,
  deleteCategory,
  deleteGalleryItem,
  deleteMessage,
  deleteProduct,
  loadAdminSnapshot,
  markMessage,
  reorder,
  setProductFlag,
  updateBrand,
  updateCategory,
  updateGalleryItem,
  updateProduct,
  updateSettings,
} from "@/lib/data/admin";
import { revalidateCatalog } from "@/lib/data/revalidate";
import {
  adminActionSchema,
  brandInputSchema,
  categoryInputSchema,
  fieldErrors,
  galleryInputSchema,
  productInputSchema,
  settingsInputSchema,
  type AdminAction,
} from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request, "catalog");
  if (!guard.ok) return guard.response;
  try {
    const snapshot = await loadAdminSnapshot(guard.supabase, guard.session);
    return NextResponse.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[admin/data] load failed:", error);
    return jsonError(500, "تعذر تحميل البيانات");
  }
}

function permissionFor(op: AdminAction["op"]): Permission {
  if (op.startsWith("message.")) return "messages";
  if (op.startsWith("settings.")) return "settings";
  return "catalog";
}

class ValidationFailure extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super("validation");
  }
}

function parse<S extends z.ZodTypeAny>(schema: S, payload: unknown): z.infer<S> {
  const result = schema.safeParse(payload);
  if (!result.success) throw new ValidationFailure(fieldErrors(result.error));
  return result.data;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError(400, "طلب غير صالح");
  }

  const envelope = adminActionSchema.safeParse(body);
  if (!envelope.success) return jsonError(400, "عملية غير معروفة");
  const action = envelope.data;

  const guard = await requireAdmin(request, permissionFor(action.op), { mutating: true });
  if (!guard.ok) return guard.response;
  const db = guard.supabase;

  try {
    let result: unknown = null;
    let affectsPublicSite = true;

    switch (action.op) {
      case "product.create":
        result = await createProduct(db, parse(productInputSchema, action.payload));
        break;
      case "product.update":
        result = await updateProduct(db, action.id, parse(productInputSchema, action.payload));
        break;
      case "product.toggle":
        result = await setProductFlag(db, action.payload.id, action.payload.field, action.payload.value);
        break;
      case "product.delete":
        await deleteProduct(db, action.payload.id);
        break;
      case "category.create":
        result = await createCategory(db, parse(categoryInputSchema, action.payload));
        break;
      case "category.update":
        result = await updateCategory(db, action.id, parse(categoryInputSchema, action.payload));
        break;
      case "category.delete":
        await deleteCategory(db, action.payload.id);
        break;
      case "category.reorder":
        await reorder(db, "categories", action.payload.ids);
        break;
      case "brand.create":
        result = await createBrand(db, parse(brandInputSchema, action.payload));
        break;
      case "brand.update":
        result = await updateBrand(db, action.id, parse(brandInputSchema, action.payload));
        break;
      case "brand.delete":
        await deleteBrand(db, action.payload.id);
        break;
      case "gallery.create":
        result = await createGalleryItem(db, parse(galleryInputSchema, action.payload));
        break;
      case "gallery.update":
        result = await updateGalleryItem(db, action.id, parse(galleryInputSchema, action.payload));
        break;
      case "gallery.delete":
        await deleteGalleryItem(db, action.payload.id);
        break;
      case "gallery.reorder":
        await reorder(db, "gallery", action.payload.ids);
        break;
      case "message.mark":
        result = await markMessage(db, action.payload.id, action.payload.is_read);
        affectsPublicSite = false;
        break;
      case "message.delete":
        await deleteMessage(db, action.payload.id);
        affectsPublicSite = false;
        break;
      case "settings.update":
        result = await updateSettings(db, parse(settingsInputSchema, action.payload));
        break;
    }

    if (affectsPublicSite) revalidateCatalog();
    return NextResponse.json({ ok: true, item: result });
  } catch (error) {
    if (error instanceof ValidationFailure) {
      return jsonError(422, "يرجى مراجعة الحقول المظللة", { fieldErrors: error.fields });
    }
    if (error instanceof DataError) {
      const status = error.code === "PGRST116" ? 404 : error.code === "42501" ? 403 : 400;
      return jsonError(status, describeDbError(error));
    }
    console.error(`[admin/data] ${action.op} failed:`, error);
    return jsonError(500, "تعذر تنفيذ العملية");
  }
}
