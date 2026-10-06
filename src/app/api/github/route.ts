import { NextRequest, NextResponse } from "next/server"
import { Octokit } from "octokit"

export async function POST(req: NextRequest) {
  try {
    const { secret, action, path: filePath, content, message } = await req.json()

    // Validate secret
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    const owner = process.env.GITHUB_OWNER!
    const repo = process.env.GITHUB_REPO!

    if (action === "listFiles") {
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
        })
        return NextResponse.json({ data })
      } catch (e: any) {
        if (e.status === 404) return NextResponse.json({ data: [] })
        throw e
      }
    }

    if (action === "getFile") {
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
        })
        if (!Array.isArray(data) && data.type === "file" && data.content) {
          const fileContent = Buffer.from(data.content, "base64").toString("utf8")
          return NextResponse.json({ content: fileContent, sha: data.sha })
        }
        return NextResponse.json({ error: "Not a file" }, { status: 400 })
      } catch (e: any) {
        if (e.status === 404) return NextResponse.json({ error: "Not found" }, { status: 404 })
        throw e
      }
    }

    if (action === "deleteFile") {
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
        })
        if (!Array.isArray(data)) {
          await octokit.rest.repos.deleteFile({
            owner,
            repo,
            path: filePath,
            message: message || `Delete ${filePath}`,
            sha: data.sha,
          })
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: "Cannot delete directory" }, { status: 400 })
      } catch (e: any) {
        throw e
      }
    }

    if (action === "saveFile") {
      let sha: string | undefined
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
        })
        if (!Array.isArray(data)) {
          sha = data.sha
        }
      } catch (e: any) {
        if (e.status !== 404) {
          throw e
        }
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: message || `Update ${filePath}`,
        content: Buffer.from(content).toString("base64"),
        sha,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (error: any) {
    console.error("GitHub API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
