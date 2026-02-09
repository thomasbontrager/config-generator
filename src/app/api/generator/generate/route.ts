import { NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"
import { templates, ConfigType } from "@/lib/templates"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { configTypes } = await request.json()

    if (!configTypes || !Array.isArray(configTypes) || configTypes.length === 0) {
      return NextResponse.json(
        { error: "Invalid config types" },
        { status: 400 }
      )
    }

    // Create ZIP file
    const zip = new JSZip()

    // Add configs to ZIP
    for (const configType of configTypes) {
      if (configType in templates) {
        const configTemplate = templates[configType as ConfigType]
        const folder = zip.folder(configType)
        
        if (folder) {
          for (const [filename, content] of Object.entries(configTemplate)) {
            folder.file(filename, content)
          }
        }
      }
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: "nodebuffer" })

    // Save to database if user is authenticated
    const session = await getServerSession(authOptions)
    if (session?.user) {
      try {
        const userId = (session.user as { id: string }).id
        await prisma.generatedConfig.create({
          data: {
            userId,
            name: `Config Bundle - ${new Date().toLocaleDateString()}`,
            description: `Generated configs: ${configTypes.join(", ")}`,
            configType: configTypes.join(","),
            content: { configTypes },
          }
        })
      } catch (dbError) {
        // Continue even if database save fails
        console.error("Failed to save config to database:", dbError)
      }
    }

    // Return ZIP file as Uint8Array
    const uint8Array = new Uint8Array(zipBlob)
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="shipforge-configs-${Date.now()}.zip"`,
      },
    })
  } catch (error) {
    console.error("Config generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate configs" },
      { status: 500 }
    )
  }
}
