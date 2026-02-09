#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import JSZip from "jszip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Available agents with their template files
const AGENTS = {
  "vite-react": {
    name: "Vite + React",
    description: "Production-ready Vite + React starter",
    templates: [
      ".env.example",
      "Dockerfile",
      "docker-compose.yml",
      "README.md"
    ]
  },
  express: {
    name: "Express",
    description: "Minimal production-ready Express server starter",
    templates: [
      ".env.example",
      "Dockerfile",
      "docker-compose.yml",
      "README.md"
    ]
  }
};

function showHelp() {
  console.log(`
Config Generator CLI

Usage:
  npm run cli                           Show interactive menu
  npm run cli -- --agents=<agents>      Generate specific agents
  npm run cli -- --list                 List all available agents
  npm run cli -- --help                 Show this help message

Options:
  --agents=<agents>   Comma-separated list of agents (e.g., vite-react,express)
  --output=<path>     Output directory (default: ./output)
  --list              List all available agents
  --help              Show this help message

Examples:
  npm run cli -- --agents=vite-react
  npm run cli -- --agents=express
  npm run cli -- --agents=vite-react,express --output=./my-configs
`);
}

function listAgents() {
  console.log("\nAvailable Agents:\n");
  Object.entries(AGENTS).forEach(([key, agent]) => {
    console.log(`  ${key.padEnd(15)} ${agent.description}`);
  });
  console.log("");
}

function loadTemplateFile(agentName, filename) {
  const templatePath = join(__dirname, "src", "templates", agentName, filename);
  try {
    return readFileSync(templatePath, "utf-8");
  } catch {
    console.error(`Warning: Could not load ${filename} for ${agentName}`);
    return null;
  }
}

function generateConfigs(selectedAgents, outputDir = "./output") {
  console.log("\nGenerating configurations...\n");

  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  let generatedCount = 0;

  selectedAgents.forEach((agentKey) => {
    const agent = AGENTS[agentKey];
    if (!agent) {
      console.error(`Error: Unknown agent "${agentKey}"`);
      return;
    }

    console.log(`📦 Generating ${agent.name}...`);

    // Create agent output directory
    const agentDir = join(outputDir, agentKey);
    if (!existsSync(agentDir)) {
      mkdirSync(agentDir, { recursive: true });
    }

    // Copy all template files for this agent
    agent.templates.forEach((filename) => {
      const content = loadTemplateFile(agentKey, filename);
      if (content) {
        const outputPath = join(agentDir, filename);
        writeFileSync(outputPath, content);
        console.log(`  ✓ ${filename}`);
        generatedCount++;
      }
    });

    console.log("");
  });

  console.log(`✅ Successfully generated ${generatedCount} files in ${outputDir}\n`);
}

async function generateZip(selectedAgents, outputPath = "./config-generator.zip") {
  console.log("\nGenerating ZIP file...\n");

  const zip = new JSZip();
  let fileCount = 0;

  selectedAgents.forEach((agentKey) => {
    const agent = AGENTS[agentKey];
    if (!agent) {
      console.error(`Error: Unknown agent "${agentKey}"`);
      return;
    }

    console.log(`📦 Adding ${agent.name}...`);

    const agentFolder = zip.folder(agentKey);

    agent.templates.forEach((filename) => {
      const content = loadTemplateFile(agentKey, filename);
      if (content) {
        agentFolder.file(filename, content);
        console.log(`  ✓ ${filename}`);
        fileCount++;
      }
    });

    console.log("");
  });

  // Generate and save the ZIP file
  const zipContent = await zip.generateAsync({ type: "nodebuffer" });
  writeFileSync(outputPath, zipContent);

  console.log(`✅ Successfully created ${outputPath} with ${fileCount} files\n`);
}

async function interactiveMode() {
  // For simplicity, we'll use a basic prompt simulation
  // In a real scenario, you might use a library like 'inquirer' or 'prompts'
  console.log("\n🚀 Config Generator - Interactive Mode\n");
  console.log("Available agents:");
  Object.entries(AGENTS).forEach(([, agent], index) => {
    console.log(`  ${index + 1}. ${agent.name} - ${agent.description}`);
  });
  
  console.log("\nTo select agents, use: npm run cli -- --agents=<agent-names>");
  console.log("Example: npm run cli -- --agents=vite-react,express\n");
  
  listAgents();
}

function parseArgs(args) {
  const parsed = {
    agents: [],
    output: "./output",
    list: false,
    help: false,
    zip: false
  };

  args.forEach((arg) => {
    if (arg.startsWith("--agents=")) {
      const agentsStr = arg.replace("--agents=", "");
      parsed.agents = agentsStr.split(",").map((a) => a.trim()).filter(Boolean);
    } else if (arg.startsWith("--output=")) {
      parsed.output = arg.replace("--output=", "");
    } else if (arg === "--list") {
      parsed.list = true;
    } else if (arg === "--help") {
      parsed.help = true;
    } else if (arg === "--zip") {
      parsed.zip = true;
    }
  });

  return parsed;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Handle help
  if (options.help) {
    showHelp();
    return;
  }

  // Handle list
  if (options.list) {
    listAgents();
    return;
  }

  // Handle agent generation
  if (options.agents.length > 0) {
    // Validate agents
    const invalidAgents = options.agents.filter((a) => !AGENTS[a]);
    if (invalidAgents.length > 0) {
      console.error(`\n❌ Error: Unknown agents: ${invalidAgents.join(", ")}`);
      console.error("Use --list to see available agents\n");
      process.exit(1);
    }

    if (options.zip) {
      await generateZip(options.agents, options.output);
    } else {
      generateConfigs(options.agents, options.output);
    }
    return;
  }

  // No arguments - show interactive mode
  await interactiveMode();
}

main().catch((error) => {
  console.error("\n❌ Error:", error.message);
  process.exit(1);
});
