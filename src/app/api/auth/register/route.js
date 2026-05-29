import { NextResponse } from "next/server";
import { connectDB } from "../../../../core/db.js";
import { UserManager } from "../../../../features/user/user.manager.js";
import { UserCreateSchema } from "../../../../features/user/dto/user.dto.js";
import { handleApiError } from "../../../../lib/api-error.js";

const m = new UserManager();

export async function POST(req) {
try {
await connectDB();

let body;
try {
body = await req.json();
} catch {
return NextResponse.json({ mesaj: "Geçersiz JSON body" }, { status: 400 });
}

const data = UserCreateSchema.parse(body);
const sonuc = await m.register(data);
return NextResponse.json(sonuc, { status: 201 });
} catch (e) {
return handleApiError(e);
}
}
