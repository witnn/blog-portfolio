import { NextRequest, NextResponse } from "next/server"
import { Octokit } from "octokit"

export async function POST(req: NextRequest) {
  try {
    const { secret, content, path: filePath, message } = await req.json()

    // Validate secret
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

    const owner = process.env.GITHUB_OWNER!
    const repo = process.env.GITHUB_REPO!

    // Get the current file SHA if it exists
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

    // Create or update the file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: message || `Update ${filePath}`,
      content: Buffer.from(content).toString("base64"),
      sha,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("GitHub API Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}
