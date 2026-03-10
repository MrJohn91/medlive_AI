import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "records.json");

// Ensure data directory and file exist
async function initDataFile() {
    const dir = path.dirname(DATA_FILE);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }

    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
}

export async function GET() {
    try {
        await initDataFile();
        const data = await fs.readFile(DATA_FILE, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error("Failed to read records:", error);
        return NextResponse.json({ error: "Failed to read records" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await initDataFile();
        const body = await request.json();

        // Auto-generate ID and timestamp if not provided
        const newRecord = {
            id: body.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: body.timestamp || new Date().toISOString(),
            ...body,
        };

        const data = await fs.readFile(DATA_FILE, "utf-8");
        const records = JSON.parse(data);

        // prepend the new record so newest is first
        records.unshift(newRecord);

        await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2));

        return NextResponse.json({ success: true, record: newRecord });
    } catch (error) {
        console.error("Failed to save record:", error);
        return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
    }
}
