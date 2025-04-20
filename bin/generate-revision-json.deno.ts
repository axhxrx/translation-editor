#!/usr/bin/env -S deno run --allow-run --allow-write=src/revision.json

import { dirname, fromFileUrl, join } from 'jsr:@std/path';

/**
 Executes a command and returns its stdout, trimming whitespace. Throws an error if the command fails.
 */
async function runCommand(cmd: string[]): Promise<string>
{
  console.log(`$ ${cmd.join(' ')}`);
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: 'piped',
    stderr: 'piped',
  });
  const output = await command.output();

  if (!output.success)
  {
    const errorText = new TextDecoder().decode(output.stderr);
    throw new Error(
      `Command failed: ${cmd.join(' ')}\n${errorText}`,
    );
  }

  return new TextDecoder().decode(output.stdout).trim();
}

/**
 Parses the GitHub org and repo name from a git remote URL. Handles both SSH and HTTPS formats.
 */
function parseGitUrl(url: string): { githubOrg: string; repoName: string } | null
{
  // SSH format: git@github.com:org/repo.git
  const sshMatch = url.match(/^git@github\.com:([^/]+)\/([^.]+)(\.git)?$/);
  if (sshMatch)
  {
    return { githubOrg: sshMatch[1], repoName: sshMatch[2] };
  }

  // HTTPS format: [https://github.com/org/repo.git](https://github.com/org/repo.git)
  const httpsMatch = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^.]+)(\.git)?$/);
  if (httpsMatch)
  {
    return { githubOrg: httpsMatch[1], repoName: httpsMatch[2] };
  }

  console.warn(`Could not parse GitHub org/repo from URL: ${url}`);
  return null;
}

try
{
  // Get current branch name
  const baseBranch = await runCommand(['git', 'rev-parse', '--abbrev-ref', 'HEAD']);

  // Get origin URL
  const originUrl = await runCommand(['git', 'config', '--get', 'remote.origin.url']);

  // Parse org and repo name
  const repoInfo = parseGitUrl(originUrl);

  if (!repoInfo)
  {
    throw new Error(`Failed to determine GitHub org and repo name from origin URL: ${originUrl}`);
  }

  const revisionData = {
    githubOrg: repoInfo.githubOrg,
    repoName: repoInfo.repoName,
    baseBranch: baseBranch,
  };

  // Determine the output path relative to the script's location
  const scriptDir = dirname(fromFileUrl(import.meta.url));
  const outputPath = join(scriptDir, '..', 'src', 'revision.json');

  console.log(`Writing revision data to ${outputPath}...`);
  await Deno.writeTextFile(outputPath, JSON.stringify(revisionData, null, 2) + '\n'); // Add newline for POSIX compatibility

  console.log('Successfully generated src/revision.json');
}
catch (error)
{
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`Error generating revision data: ${err.message}`);
  Deno.exit(1);
}
