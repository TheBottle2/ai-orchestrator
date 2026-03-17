import { NextResponse } from "next/server";
import { connectDB } from "../../../../core/db.js";
import { UserManager } from "../../../../features/user/user.manager.js";
import { UserLoginSchema } from "../../../../features/user/dto/user.dto.js";
const m = new UserManager();
export async function POST(req) {
  try { await connectDB(); const v = UserLoginSchema.parse(await req.json()); return NextResponse.json(await m.login(v.email, v.sifre)); }
  catch (e) { return NextResponse.json({ mesaj: e.message }, { status: 401 }); }
}
