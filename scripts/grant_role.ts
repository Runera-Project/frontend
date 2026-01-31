
import { createWalletClient, createPublicClient, http, custom, keccak256, toBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
// import 'dotenv/config'; // Removed to avoid dependency issue

// Load env manually if needed or assume process.env is populated by the runner (e.g. next/env)
// For this script, we'll try to load .env.local manually if dotenv fails
import fs from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    
    const paths = [envPath, envLocalPath];
    
    for (const p of paths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        content.split('\n').forEach(line => {
          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
            process.env[key] = value;
          }
        });
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to load .env files manually:', e);
  }
}

loadEnv();

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://base-sepolia.g.alchemy.com/v2/zLbuFi4TN6im35POeM45p';
const ACCESS_CONTROL_ADDRESS = process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS as `0x${string}`;

// Role definition
const BACKEND_SIGNER_ROLE = keccak256(toBytes("BACKEND_SIGNER_ROLE"));

// ABI for AccessControl
const ABI = [
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' }
    ],
    name: 'hasRole',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

async function main() {
  // Get arguments
  const backendAddress = process.argv[2];
  const privateKey = process.env.PRIVATE_KEY;

  if (!backendAddress) {
    console.error('❌ Usage: npx tsx scripts/grant_role.ts <BACKEND_WALLET_ADDRESS>');
    process.exit(1);
  }

  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in .env or .env.local');
    console.log('💡 Please add PRIVATE_KEY=0x... to your .env file (The wallet that deployed the contracts)');
    process.exit(1);
  }

  if (!ACCESS_CONTROL_ADDRESS) {
    console.error('❌ NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS not found');
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL)
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL)
  });

  console.log(`🔌 Connected as Admin: ${account.address}`);
  console.log(`🎯 Target Backend Address: ${backendAddress}`);
  console.log(`🔐 Access Control Contract: ${ACCESS_CONTROL_ADDRESS}`);
  console.log(`🔑 Role Hash: ${BACKEND_SIGNER_ROLE}`);

  // Check if already has role
  const hasRole = await publicClient.readContract({
    address: ACCESS_CONTROL_ADDRESS,
    abi: ABI,
    functionName: 'hasRole',
    args: [BACKEND_SIGNER_ROLE, backendAddress as `0x${string}`]
  });

  if (hasRole) {
    console.log('✅ Address ALREADY has BACKEND_SIGNER_ROLE. No action needed.');
    return;
  }

  console.log('⏳ Granting role... Please wait for transaction...');

  try {
    const hash = await client.writeContract({
      address: ACCESS_CONTROL_ADDRESS,
      abi: ABI,
      functionName: 'grantRole',
      args: [BACKEND_SIGNER_ROLE, backendAddress as `0x${string}`]
    });

    console.log(`✅ Transaction sent! Hash: ${hash}`);
    console.log(`🔗 View on Explorer: https://sepolia.basescan.org/tx/${hash}`);
    
    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log('🎉 Role granted successfully!');
    } else {
      console.error('❌ Transaction reverted!');
    }

  } catch (error) {
    console.error('❌ Failed to grant role:', error);
  }
}

main();
