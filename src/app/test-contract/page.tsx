"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";

// Program ID from Anchor.toml
const PROGRAM_ID = new PublicKey("59jc5wTraRWdWGfS8JuF3C4HJhkN7jm8H9GAfCho9C77");

// Use the verified mint address that exists on localnet
const DEMO_LST_MINT = "3hrENHzfwHBzC5USvp4TcHdGSw29kq111qonYCAhHaeW";

export default function TestContract() {
  const { publicKey, sendTransaction, connected, signTransaction, signAllTransactions } = useWallet();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [program, setProgram] = useState<anchor.Program | null>(null);
  const [loading, setLoading] = useState({
    initialize: false,
    lock: false,
    claim: false,
    initNgo: false,
    addNgo: false,
    removeNgo: false,
    updateConfig: false
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [idl, setIdl] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [isNgoRegistryInitialized, setIsNgoRegistryInitialized] = useState<boolean | null>(null);
  const [ngos, setNgos] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  
  // Form states
  const [initializeForm, setInitializeForm] = useState({
    admin: "",
    upgradeAuthority: "",
    donationPercentage: "10",
    ngoTreasury: ""
  });
  
  const [lockLstForm, setLockLstForm] = useState({
    amount: "",
    lockMonths: "6",
    donationPercentage: "10",
    lstPrice: "1000000", // 1.00 USD with 6 decimals
    selectedNgoTreasury: "",
    lstMint: DEMO_LST_MINT, // default to demo LST
  });
  
  const [claimLstForm, setClaimLstForm] = useState({
    lstPrice: "1000000", // 1.00 USD with 6 decimals
    lstMint: DEMO_LST_MINT,
  });

  const [addNgoForm, setAddNgoForm] = useState({
    name: "",
    treasury: "",
    treasuryType: "Wallet",
    description: ""
  });

  const [updateConfigForm, setUpdateConfigForm] = useState({
    newAdmin: "",
    newUpgradeAuthority: "",
    newDonationPercentage: "",
    newNgoTreasury: ""
  });

  // NEW: User Charity Profile states
  const [userCharityProfile, setUserCharityProfile] = useState<any>(null);
  const [charityProfileInitialized, setCharityProfileInitialized] = useState<boolean>(false);
  const [charityLoading, setCharityLoading] = useState({
    initialize: false,
    fetch: false
  });

  // NEW: User lock tracking states
  const [userLocks, setUserLocks] = useState<any[]>([]);
  const [lockLoading, setLockLoading] = useState(false);

  // NEW: Function to initialize user charity profile
  const initializeUserCharityProfile = async () => {
    if (!publicKey || !program) return;
    
    setCharityLoading(prev => ({ ...prev, initialize: true }));
    setMessage("Initializing your charity profile...");
    setMessageType("info");

    try {
      const tx = await program.methods
        .initializeUserCharityProfile()
        .accounts({
          user: publicKey,
        })
        .rpc();

      setMessage(`✅ Charity profile initialized! Transaction: ${tx}`);
      setMessageType("success");
      setCharityProfileInitialized(true);
      
      // Fetch the profile after initialization
      await fetchUserCharityProfile();
      
    } catch (error: any) {
      console.error("Error initializing charity profile:", error);
      if (error.message.includes("already in use")) {
        setMessage("⚠️ Charity profile already exists! Fetching data...");
        setMessageType("info");
        setCharityProfileInitialized(true);
        await fetchUserCharityProfile();
      } else {
        setMessage(`❌ Error: ${error.message}`);
        setMessageType("error");
      }
    } finally {
      setCharityLoading(prev => ({ ...prev, initialize: false }));
    }
  };

  // NEW: Function to fetch user charity profile data
  const fetchUserCharityProfile = async () => {
    if (!publicKey || !program) return;

    setCharityLoading(prev => ({ ...prev, fetch: true }));
    
    try {
      // First, try to call the view function
      await program.methods
        .getUserCharityData()
        .accounts({
          user: publicKey,
        })
        .rpc();

      // Then fetch the actual data
      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_charity_profile"), publicKey.toBuffer()],
        program.programId
      );

             const profileData = await (program.account as any).userCharityProfile.fetch(userProfilePda);
      
      setUserCharityProfile({
        owner: profileData.owner.toString(),
        totalDonationsUsd: profileData.totalDonationsUsd.toString(),
        totalDonationsCount: profileData.totalDonationsCount,
        lastDonationTimestamp: profileData.lastDonationTimestamp.toString(),
        favoriteNgo: profileData.favoriteNgo?.toString() || null,
        isInitialized: profileData.isInitialized
      });
      
      setCharityProfileInitialized(true);
      setMessage("✅ Charity profile data loaded successfully!");
      setMessageType("success");
      
    } catch (error: any) {
      console.error("Error fetching charity profile:", error);
      if (error.message.includes("Account does not exist")) {
        setMessage("❌ Charity profile not found. Please initialize first.");
        setCharityProfileInitialized(false);
      } else {
        setMessage(`❌ Error fetching profile: ${error.message}`);
      }
      setMessageType("error");
    } finally {
      setCharityLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // NEW: Function to format USD amount
  const formatUsdAmount = (amountStr: string) => {
    const amount = parseInt(amountStr) / 1_000_000; // Convert from 6 decimals
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  // NEW: Function to format timestamp
  const formatTimestamp = (timestampStr: string) => {
    const timestamp = parseInt(timestampStr);
    if (timestamp === 0) return "Never";
    return new Date(timestamp * 1000).toLocaleString();
  };

  // NEW: Function to check if charity profile exists
  const checkCharityProfileExists = async () => {
    if (!publicKey || !program) return;

    try {
      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_charity_profile"), publicKey.toBuffer()],
        program.programId
      );

      const profileAccount = await connection?.getAccountInfo(userProfilePda);
      const exists = profileAccount !== null;
      setCharityProfileInitialized(exists);
      
      if (exists) {
        await fetchUserCharityProfile();
      }
    } catch (error) {
      console.error("Error checking charity profile:", error);
      setCharityProfileInitialized(false);
    }
  };

  // NEW: Function to fetch user's existing locks
  const fetchUserLocks = async () => {
    if (!publicKey || !program) return;

    setLockLoading(true);
    try {
      const foundLocks: any[] = [];
      // Use all mints the user has ever had a token account for
      const uniqueMints = [...new Set([...userLSTMints, lockLstForm.lstMint])];
      for (const mintStr of uniqueMints) {
        try {
          const lstMint = new PublicKey(mintStr);
          const [userLockPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_lock"), publicKey.toBuffer(), lstMint.toBuffer()],
            program.programId
          );
          const lockData = await (program.account as any).userLockAccount.fetch(userLockPda);
          foundLocks.push({
            lstMint: lockData.lstMint.toString(),
            amount: lockData.amount.toString(),
            rawAmount: lockData.amount,
            depositTimestamp: lockData.depositTimestamp.toString(),
            unlockTimestamp: lockData.unlockTimestamp.toString(),
            donationPercentage: lockData.donationPercentage,
            isClaimed: lockData.isClaimed,
            pda: userLockPda.toString()
          });
        } catch (fetchError) {
          // No lock exists for this mint, continue
        }
      }
      setUserLocks(foundLocks);
      if (foundLocks.length > 0) {
        showMessage(`✅ Found ${foundLocks.length} existing lock(s)`, "info");
      }
    } catch (error: any) {
      console.error("Error fetching user locks:", error);
    } finally {
      setLockLoading(false);
    }
  };

  // NEW: Function to format lock status
  const getLockStatus = (unlockTimestamp: string, isClaimed: boolean) => {
    if (isClaimed) return { status: "Claimed", color: "text-green-400" };
    
    const unlockTime = parseInt(unlockTimestamp) * 1000;
    const now = Date.now();
    
    if (now >= unlockTime) {
      return { status: "Ready to Claim", color: "text-yellow-400" };
    } else {
      const timeLeft = Math.ceil((unlockTime - now) / (1000 * 60 * 60 * 24));
      return { status: `Locked (${timeLeft} days left)`, color: "text-blue-400" };
    }
  };

  // NEW: Function to suggest alternate LST mint addresses for testing
  const suggestAlternateLst = () => {
          // For localnet, we need to create actual mints that exist
      // Let's just suggest the user can manually input a different mint address
      const demoMints = [
        "3hrENHzfwHBzC5USvp4TcHdGSw29kq111qonYCAhHaeW", // Our original demo LST
        "2VrRWgJJJ16hsfQWPLJJrKd2W5hU3sFHtiDUW81K2wZN", // From our tests
        "5ZnGnw8wCGvQGPdoWaohypnZukBhKBQ9EPhspeH4324W", // Another test mint
        "2MdxCMjknRjykZumDkoRo8LqHAK4DGS4XRW9NH8pfYsS", // New demo LST for testing
      ];
    
    // Find a different mint than the current one
    const currentMint = lockLstForm.lstMint;
    const differentMint = demoMints.find(mint => mint !== currentMint) || demoMints[0];
    
    setLockLstForm(prev => ({
      ...prev,
      lstMint: differentMint
    }));
    
    showMessage(`💡 Switched to alternate demo LST: ${differentMint}`, "info");
  };

  // NEW: Function to validate if a mint exists before locking
  const validateMintExists = async (mintAddress: string): Promise<boolean> => {
    if (!connection) return false;
    
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const mintInfo = await connection.getAccountInfo(mintPubkey);
      return mintInfo !== null;
    } catch (error) {
      console.error("Error validating mint:", error);
      return false;
    }
  };

  const [userLSTMints, setUserLSTMints] = useState<string[]>([]);

  // Fetch all SPL token mints with nonzero balance for the connected wallet
  const fetchUserLSTMints = async () => {
    if (!publicKey || !connection) return;
    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });
      const mints = accounts.value
        .filter(acc => {
          const amount = acc.account.data.parsed.info.tokenAmount.uiAmount;
          return amount && amount > 0;
        })
        .map(acc => acc.account.data.parsed.info.mint);
      setUserLSTMints([...new Set(mints)]);
      // If the current selected mint is not in the list, set it to the first one
      if (mints.length > 0 && !mints.includes(lockLstForm.lstMint)) {
        setLockLstForm(prev => ({ ...prev, lstMint: mints[0] }));
      }
    } catch (err) {
      console.error("Error fetching user LST mints:", err);
      setUserLSTMints([]);
    }
  };

  // Fetch mints on wallet connect
  useEffect(() => {
    if (publicKey && connection) {
      fetchUserLSTMints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, connection]);

  // Load IDL on component mount
  useEffect(() => {
    const loadIdl = async () => {
      try {
        const response = await fetch('/staker.json');
        const idlData = await response.json();
        setIdl(idlData);
        console.log('IDL loaded successfully');
      } catch (error) {
        console.error('Failed to load IDL:', error);
        showMessage('Failed to load smart contract interface', 'error');
      }
    };
    
    loadIdl();
  }, []);

  // Check wallet balance
  useEffect(() => {
    const checkBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Failed to get balance:', error);
        }
      }
    };
    
    checkBalance();
  }, [connected, publicKey, connection]);

  // Check if program is initialized
  useEffect(() => {
    const checkInitialization = async () => {
      if (program && connection && publicKey) {
        try {
          const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
          );
          
          const configAccount = await (program.account as any).config.fetch(configPda);
          setIsInitialized(Boolean(configAccount.isInitialized));
          setConfigData(configAccount);

          // Fetch NGO registry
          const [ngoRegistryPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("ngo_registry")],
            program.programId
          );
          try {
            const registry = await (program.account as any).ngoRegistry.fetch(ngoRegistryPda);
            setIsNgoRegistryInitialized(true);
            setNgos(registry.ngos || []);
          } catch {
            setIsNgoRegistryInitialized(false);
          }

          console.log('Program initialization status:', configAccount.isInitialized);
        } catch (error: any) {
          console.log('Program not initialized yet or error checking status:', error);
          setIsInitialized(false);
        }
      }
    };
    
    checkInitialization();
  }, [program, connection, publicKey]);

  // Initialize Anchor program
  useEffect(() => {
    if (connected && publicKey && idl && signTransaction && signAllTransactions) {
      console.log('Setting up Anchor provider...');
      // Use environment variable for RPC endpoint, fallback to localnet
      const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST || "http://127.0.0.1:8899";
      const conn = new Connection(rpcEndpoint, "confirmed");
      setConnection(conn);
      
      // Create a proper wallet adapter
      const walletAdapter = {
        publicKey,
        signTransaction: async (tx: anchor.web3.Transaction) => {
          return await signTransaction(tx) as anchor.web3.Transaction;
        },
        signAllTransactions: async (txs: anchor.web3.Transaction[]) => {
          return await signAllTransactions(txs) as anchor.web3.Transaction[];
        }
      } as anchor.Wallet;
    
      try {
        // Initialize Anchor program
        const provider = new anchor.AnchorProvider(
          conn,
          walletAdapter,
          { commitment: "confirmed" }
        );
        
        anchor.setProvider(provider);
        
        // Load program
        const prog = new anchor.Program(idl, provider);
        setProgram(prog);
        
        console.log('Program initialized successfully');
        showMessage("Connected to StakerFun program!", "success");
        
        // Check charity profile and user locks after program is loaded
        setTimeout(() => {
          checkCharityProfileExists();
          fetchUserLocks();
        }, 1000);
      } catch (error: any) {
        console.error('Program initialization error:', error);
        showMessage(`Error initializing program: ${error.message}`, "error");
      }
    }
  }, [connected, publicKey, idl, signTransaction, signAllTransactions]);

  const showMessage = (msg: string, type: "success" | "error" | "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };


  const handleInitialize = async () => {
    if (!program || !publicKey || !connection) {
      showMessage("Please connect your wallet first", "error");
      return;
    }

    setLoading({ ...loading, initialize: true });
    try {
      const admin = new PublicKey(initializeForm.admin || publicKey.toString());
      const upgradeAuthority = new PublicKey(initializeForm.upgradeAuthority || publicKey.toString());
      const ngoTreasury = new PublicKey(initializeForm.ngoTreasury || publicKey.toString());
      const donationPercentage = parseInt(initializeForm.donationPercentage);

      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      console.log("Initializing program with:", {
        admin: admin.toString(),
        upgradeAuthority: upgradeAuthority.toString(),
        donationPercentage,
        configPda: configPda.toString()
      });

      const tx = await program.methods
  .initialize(admin, upgradeAuthority, donationPercentage) // Remove ngoTreasury from here
  .accounts({
    config: configPda,
    admin: publicKey,
    ngoTreasury: ngoTreasury, // Keep it here in accounts
    systemProgram: SystemProgram.programId,
  })
  .rpc();

      showMessage(`Program initialized! Transaction: ${tx}`, "success");
      setIsInitialized(true);

      // Fetch updated config
      const configAccount = await program.account.config.fetch(configPda);
      setConfigData(configAccount);
    } catch (error: any) {
      console.error("Initialize error:", error);
      
      // Check if the error is due to account already existing
      if (error.message && error.message.includes("already in use")) {
        showMessage("Program is already initialized! You can proceed with other functions.", "info");
        setIsInitialized(true);
      } else {
        showMessage(`Initialize failed: ${error.message || error}`, "error");
      }
    } finally {
      setLoading({ ...loading, initialize: false });
    }
  };

  const handleLockLst = async () => {
    if (!program || !publicKey || !connection) {
      showMessage("Please connect your wallet first", "error");
      return;
    }

    if (isInitialized === false) {
      showMessage("Please initialize the program first", "error");
      return;
    }

     setLoading({ ...loading, lock: true });
    try {
      // First, validate that the LST mint exists
      const mintExists = await validateMintExists(lockLstForm.lstMint);
      if (!mintExists) {
        showMessage(`❌ LST mint ${lockLstForm.lstMint} does not exist on this network. Try using the demo LST or click 'Try Different LST Mint'.`, "error");
        return;
      }

      const amount = new BN(parseFloat(lockLstForm.amount) * 1e9); // Convert to smallest unit
      const lockMonths = parseInt(lockLstForm.lockMonths);
      const donationPercentage = parseInt(lockLstForm.donationPercentage);
      const lstPrice = new BN(lockLstForm.lstPrice);

      const lstMint = new PublicKey(lockLstForm.lstMint);
      
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), lstMint.toBuffer()],
        program.programId
      );

      const [userLockPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_lock"), publicKey.toBuffer(), lstMint.toBuffer()],
        program.programId
      );

      const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_authority")],
        program.programId
      );

      // Get user's token account
      const userTokenAccount = await getAssociatedTokenAddress(lstMint, publicKey);

      const selectedNgoTreasury = lockLstForm.selectedNgoTreasury 
        ? new PublicKey(lockLstForm.selectedNgoTreasury)
        : null;

      console.log("Locking LST with:", {
        amount: amount.toString(),
        lockMonths,
        donationPercentage,
        lstPrice: lstPrice.toString(),
        userTokenAccount: userTokenAccount.toString(),
        vaultPda: vaultPda.toString(),
        userLockPda: userLockPda.toString()
      });

      const tx = await program.methods
        .lockLst(amount, lockMonths, donationPercentage, lstPrice, selectedNgoTreasury)
        .accounts({
          config: configPda,
          user: publicKey,
          lstMint,
          userTokenAccount,
          vault: vaultPda,
          vaultAuthority: vaultAuthorityPda,
          userLock: userLockPda,
          selectedNgoTreasury: selectedNgoTreasury || new PublicKey('11111111111111111111111111111111'),
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      showMessage(`LST locked successfully! Transaction: ${tx}`, "success");
    } catch (error: any) {
      console.error("Lock LST error:", error);
      
      if (error.message && (error.message.includes("already in use") || error.message.includes("0x0"))) {
        showMessage("⚠️ You already have a lock for this LST mint. Each user can only have one lock per LST type. Try clicking 'Try Different LST Mint' or wait to claim your existing lock.", "error");
        // Fetch existing locks to show user
        await fetchUserLocks();
      } else {
        showMessage(`Lock LST failed: ${error.message || error}`, "error");
      }
    } finally {
       setLoading({ ...loading, lock: false });
    }
  };

  const handleClaimLst = async () => {
    if (!program || !publicKey || !connection) {
      showMessage("Please connect your wallet first", "error");
      return;
    }

    if (isInitialized === false) {
      showMessage("Please initialize the program first", "error");
      return;
    }

    setLoading({ ...loading, claim: true });
    try {
      const lstPrice = new BN(claimLstForm.lstPrice);
      
      // For testing, we'll use a dummy LST mint
      const lstMint = new PublicKey("So11111111111111111111111111111111111111112"); // SOL mint for testing
      
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      const [userLockPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_lock"), publicKey.toBuffer(), lstMint.toBuffer()],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), lstMint.toBuffer()],
        program.programId
      );

      const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault_authority")],
        program.programId
      );

      const userTokenAccount = await getAssociatedTokenAddress(lstMint, publicKey);

      console.log("Claiming LST with:", {
        lstPrice,
        userLockPda: userLockPda.toString(),
        vaultPda: vaultPda.toString(),
        userTokenAccount: userTokenAccount.toString()
      });

      const tx = await program.methods
        .claimLst(lstPrice)
        .accounts({
          config: configPda,
          user: publicKey,
          lstMint: lstMint,
          userLock: userLockPda,
          userTokenAccount: userTokenAccount,
          vault: vaultPda,
          vaultAuthority: vaultAuthorityPda,
          selectedNgoTreasury: new PublicKey('11111111111111111111111111111111'),
          globalNgoTreasury: new PublicKey(initializeForm.ngoTreasury || publicKey.toString()),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      showMessage(`LST claimed successfully! Transaction: ${tx}`, "success");
      
      // Refresh user locks and charity profile after claiming
      await fetchUserLocks();
      if (charityProfileInitialized) {
        await fetchUserCharityProfile();
      }
    } catch (error: any) {
      console.error("Claim LST error:", error);
      showMessage(`Claim LST failed: ${error.message || error}`, "error");
    } finally {
      setLoading({ ...loading, claim: false });
    }
  };

  const initializeNgoRegistry = async () => {
    if (!program || !publicKey) {
      showMessage("Please connect your wallet first", "error");
      return;
    }

    setLoading({ ...loading, initNgo: true });
    
    try {
      const [ngoRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("ngo_registry")],
        program.programId
      );

      const tx = await program.methods
        .initializeNgoRegistry(publicKey)
        .accounts({
          ngoRegistry: ngoRegistryPda,
          admin: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      showMessage(`NGO registry initialized! Transaction: ${tx}`, "success");
      setIsNgoRegistryInitialized(true);
      
      // Fetch updated registry
      const registry = await (program.account as any).ngoRegistry.fetch(ngoRegistryPda);
      setNgos(registry.ngos || []);
    } catch (error) {
      console.error("NGO registry init failed:", error);
      showMessage(`NGO registry init failed: ${error}`, "error");
    } finally {
      setLoading({ ...loading, initNgo: false });
    }
  };

  const addNgo = async () => {
    if (!program || !publicKey) {
      showMessage("Please connect your wallet first", "error");
      return;
    }

    setLoading({ ...loading, addNgo: true });

    if (!addNgoForm.name.trim()) {
      showMessage("NGO name is required", "error");
      console.error("NGO name is required");
      return;
    }
    
    try {
      const [ngoRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("ngo_registry")],
        program.programId
      );

      const tx = await program.methods
        .addNgo(
          addNgoForm.name,
          new PublicKey(addNgoForm.treasury || publicKey.toString()),
          { [addNgoForm.treasuryType.toLowerCase()]: {} },
          addNgoForm.description
        )
        .accounts({
          ngoRegistry: ngoRegistryPda,
          admin: publicKey,
        })
        .rpc();

      showMessage(`NGO added successfully! Transaction: ${tx}`, "success");
      
      // Fetch updated registry
      const registry = await (program.account as any).ngoRegistry.fetch(ngoRegistryPda);
      setNgos(registry.ngos || []);
    } catch (error) {
      console.error("Add NGO failed:", error);
      showMessage(`Add NGO failed: ${error}`, "error");
    } finally {
      setLoading({ ...loading, addNgo: false });
    }
  };

  const removeNgo = async (treasury: string) => {
    if (!program || !publicKey) {
      showMessage("Please connect your wallet first", "error");
      return;
    }

    setLoading({ ...loading, removeNgo: true });
    
    try {
      const [ngoRegistryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("ngo_registry")],
        program.programId
      );

      const tx = await program.methods
        .removeNgo(new PublicKey(treasury))
        .accounts({
          ngoRegistry: ngoRegistryPda,
          admin: publicKey,
        })
        .rpc();

      showMessage(`NGO removed successfully! Transaction: ${tx}`, "success");
      
      // Fetch updated registry
      const registry = await (program.account as any).ngoRegistry.fetch(ngoRegistryPda);
      setNgos(registry.ngos || []);
    } catch (error) {
      console.error("Remove NGO failed:", error);
      showMessage(`Remove NGO failed: ${error}`, "error");
    } finally {
      setLoading({ ...loading, removeNgo: false });
    }
  };

  const updateConfig = async () => {
    if (!program || !publicKey || !configData) {
      showMessage("Please connect your wallet first", "error");
      return;
    }

    setLoading({ ...loading, updateConfig: true });
    
    try {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      const newAdmin = updateConfigForm.newAdmin 
        ? new PublicKey(updateConfigForm.newAdmin) 
        : new PublicKey(configData?.admin.toString());
      
      const newUpgradeAuthority = updateConfigForm.newUpgradeAuthority 
        ? new PublicKey(updateConfigForm.newUpgradeAuthority) 
        : new PublicKey(configData?.upgradeAuthority.toString());
      
      const newDonationPercentage = updateConfigForm.newDonationPercentage 
        ? parseInt(updateConfigForm.newDonationPercentage)
        : configData?.donationPercentage;
      
      const newNgoTreasury = updateConfigForm.newNgoTreasury 
        ? new PublicKey(updateConfigForm.newNgoTreasury) 
        : new PublicKey(configData?.ngo_treasury || publicKey.toString());

      const tx = await program.methods
        .updateConfig(
          newAdmin,
          newUpgradeAuthority,
          newDonationPercentage,
          newNgoTreasury
        )
        .accounts({
          config: configPda,
          admin: publicKey,
        })
        .rpc();

      showMessage(`Config updated successfully! Transaction: ${tx}`, "success");
      
      // Fetch updated config
      const configAccount = await program.account.config.fetch(configPda);
      setConfigData(configAccount);
    } catch (error) {
      console.error("Update config error:", error);
      showMessage(`Update config failed: ${error}`, "error");
    } finally {
      setLoading({ ...loading, updateConfig: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-purple-300">StakerFun Smart Contract Tester</h1>
          <p className="text-lg text-gray-300 mb-6">Test your smart contract functions with Phantom wallet</p>
          
          <div className="flex justify-center mb-6">
            <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" />
          </div>
          
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              messageType === "success" ? "bg-green-600" :
              messageType === "error" ? "bg-red-600" : "bg-blue-600"
            }`}>
              {message}
            </div>
          )}
        </div>

        {!connected ? (
          <div className="text-center">
            <p className="text-xl text-gray-300">Please connect your Phantom wallet to start testing</p>
          </div>
        ) : (
          <>
            {/* Wallet Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400">Wallet Address</p>
                  <p className="font-mono text-sm">{publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="font-mono text-sm">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Network</p>
                  <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_SOLANA_NETWORK || "Localnet"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Program ID</p>
                  <p className="font-mono text-sm truncate" title={PROGRAM_ID.toString()}>
                    {PROGRAM_ID.toString().slice(0, 6)}...{PROGRAM_ID.toString().slice(-6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Program Status</p>
                  <p className="font-mono text-sm">
                    {isInitialized === null ? 'Checking...' : 
                      isInitialized ? '✅ Initialized' : '❌ Not Initialized'}
                  </p>
                </div>
              </div>
            </div>

            {/* Program Info Panel */}
            {isInitialized && configData && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">Program Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400">Admin</p>
                    <p className="font-mono text-sm">{configData.admin.toString().slice(0, 8)}...{configData.admin.toString().slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Upgrade Authority:</p>
                    <p className="font-mono text-sm">{configData.upgradeAuthority.toString().slice(0, 6)}...{configData.upgradeAuthority.toString().slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Donation %</p>
                    <p>{configData.donationPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">NGO Treasury</p>
                    <p className="font-mono text-sm">
                      {configData.ngo_treasury
                        ? `${configData.ngo_treasury.toString().slice(0, 8)}...${configData.ngo_treasury.toString().slice(-8)}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-purple-400">NGO Registry</h2>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  isNgoRegistryInitialized ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {isNgoRegistryInitialized === null ? 'Checking...' : 
                   isNgoRegistryInitialized ? 'Initialized' : 'Not Initialized'}
                </div>
              </div>
                
              {isNgoRegistryInitialized && ngos.length > 0 && (
                <div className="max-h-55 overflow-y-auto pr-2">
                  {ngos.map((ngo, index) => (
                    <div key={index} className="py-2 border-b border-gray-700 last:border-0">
                      <div className="flex justify-between">
                        <span className="font-medium truncate max-w-[120px]">{ngo.name}</span>
                        <button 
                          onClick={() => removeNgo(ngo.treasury.toString())}
                          className="text-red-400 hover:text-red-300 text-sm"
                          disabled={loading.removeNgo}
                        >
                          {loading.removeNgo ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{ngo.description}</p>
                      <p className="text-xs font-mono mt-1">
                        Treasury: {ngo.treasury.toString().slice(0, 6)}...{ngo.treasury.toString().slice(-6)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Initialize Program */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">Initialize Program</h2>
                {isInitialized ? (
                  <div className="text-center py-8">
                    <p className="text-green-400 mb-4">✅ Program is already initialized!</p>
                    <p className="text-gray-300 text-sm">You can proceed with other functions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Address</label>
                      <input
                        type="text"
                        value={initializeForm.admin}
                        onChange={(e) => setInitializeForm({...initializeForm, admin: e.target.value})}
                        placeholder={publicKey?.toString()}
                        className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Upgrade Authority</label>
                      <input
                        type="text"
                        value={initializeForm.upgradeAuthority}
                        onChange={(e) => setInitializeForm({...initializeForm, upgradeAuthority: e.target.value})}
                        placeholder={publicKey?.toString()}
                        className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Donation Percentage (1-100)</label>
                      <input
                        type="number"
                        value={initializeForm.donationPercentage}
                        onChange={(e) => setInitializeForm({...initializeForm, donationPercentage: e.target.value})}
                        min="1"
                        max="100"
                        className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">NGO Treasury</label>
                      <input
                        type="text"
                        value={initializeForm.ngoTreasury}
                        onChange={(e) => setInitializeForm({...initializeForm, ngoTreasury: e.target.value})}
                        placeholder={publicKey?.toString()}
                        className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                      />
                    </div>
                    <button
                      onClick={handleInitialize}
                      disabled={loading.initialize}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                    >
                      {loading.initialize ? "Initializing..." : "Initialize Program"}
                    </button>
                  </div>
                )}
              </div>

              {/* Lock LST */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">Lock LST</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (lamports)</label>
                    <input
                      type="number"
                      value={lockLstForm.amount}
                      onChange={(e) => setLockLstForm({...lockLstForm, amount: e.target.value})}
                      placeholder="1000000"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lock Duration (months)</label>
                    <input
                      type="number"
                      value={lockLstForm.lockMonths}
                      onChange={(e) => setLockLstForm({...lockLstForm, lockMonths: e.target.value})}
                      min="1"
                      max="12"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                    />
                    <p className="text-xs text-yellow-400">
                      For testing: Each 'month' is actually 1 minute.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Donation Percentage (1-100)</label>
                    <input
                      type="number"
                      value={lockLstForm.donationPercentage}
                      onChange={(e) => setLockLstForm({...lockLstForm, donationPercentage: e.target.value})}
                      min="1"
                      max="100"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">LST Price (6 decimals)</label>
                    <input
                      type="number"
                      value={lockLstForm.lstPrice}
                      onChange={(e) => setLockLstForm({...lockLstForm, lstPrice: e.target.value})}
                      placeholder="1000000"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select LST Token</label>
                    <select
                      value={lockLstForm.lstMint}
                      onChange={e => setLockLstForm({ ...lockLstForm, lstMint: e.target.value })}
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                    >
                      {userLSTMints.length === 0 && (
                        <option value="">No LSTs found in your wallet</option>
                      )}
                      {userLSTMints.map(mint => (
                        <option key={mint} value={mint}>
                          {mint.slice(0, 8)}...{mint.slice(-8)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select NGO Treasury (optional)</label>
                    <select
                      value={lockLstForm.selectedNgoTreasury}
                      onChange={e => setLockLstForm({...lockLstForm, selectedNgoTreasury: e.target.value})}
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                    >
                      <option value="">Select an NGO</option>
                      {ngos.map((ngo, index) => (
                        <option key={index} value={ngo.treasury.toString()}>
                          {ngo.name} ({ngo.treasury.toString().slice(0, 8)}...)
                        </option>
                      ))}
                    </select>

                    {/* <input
                      type="text"
                      value={lockLstForm.selectedNgoTreasury}
                      onChange={(e) => setLockLstForm({...lockLstForm, selectedNgoTreasury: e.target.value})}
                      placeholder="Optional NGO treasury address"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                    /> */}
                  </div>
                  <button
                    onClick={handleLockLst}
                    disabled={loading.lock || !isInitialized}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                    {loading.lock ? "Locking LST..." : "Lock LST"}
                  </button>
                  
                  <button
                    onClick={suggestAlternateLst}
                    disabled={loading.lock}
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
                  >
                    🎲 Try Different LST Mint
                  </button>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    💡 If you get "already in use" error, try a different LST mint above
                  </p>
                </div>
              </div>

              {/* Claim LST */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">Claim LST</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current LST Price (6 decimals)</label>
                    <input
                      type="number"
                      value={claimLstForm.lstPrice}
                      onChange={(e) => setClaimLstForm({...claimLstForm, lstPrice: e.target.value})}
                      placeholder="1000000"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded text-white"
                    />
                  </div>
                  <button
                    onClick={handleClaimLst}
                    disabled={loading.claim || !isInitialized}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                    {loading.claim ? "Claiming LST..." : "Claim LST"}
                  </button>
                </div>
              </div>
            </div>

            {/* User Locks Section */}
            {connected && userLocks.length > 0 && (
              <div className="col-span-1 lg:col-span-3 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-purple-300">🔒 Your Active Locks</h2>
                    <button
                      onClick={fetchUserLocks}
                      disabled={lockLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      {lockLoading ? "Loading..." : "🔄 Refresh Locks"}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {userLocks.map((lock, index) => {
                      const lockStatus = getLockStatus(lock.unlockTimestamp, lock.isClaimed);
                      
                      // Parse amount from the blockchain data
                      let lockAmount = 0;
                      try {
                        // The amount should be a string representation of the BN
                        const rawAmountStr = lock.amount.toString();
                        const rawAmount = parseFloat(rawAmountStr);
                        lockAmount = rawAmount / 1e9; // Convert from smallest unit to LST tokens
                        
                        console.log(`Lock amount parsing: raw="${rawAmountStr}", parsed=${rawAmount}, tokens=${lockAmount}`);
                      } catch (error) {
                        console.error("Error parsing lock amount:", error, lock);
                        lockAmount = 0;
                      }
                      
                      const unlockDate = new Date(parseInt(lock.unlockTimestamp) * 1000);
                      
                      console.log(`Lock ${index}: raw amount = ${lock.amount}, raw BN = ${lock.rawAmount}, parsed = ${lockAmount}`); // Debug log
                      
                      return (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">LST Mint</p>
                              <p className="font-mono text-sm">{lock.lstMint.slice(0, 8)}...{lock.lstMint.slice(-8)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Amount Locked</p>
                              <p className="font-semibold">{lockAmount.toFixed(2)} LST</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Donation %</p>
                              <p className="font-semibold">{lock.donationPercentage}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Status</p>
                              <p className={`font-semibold ${lockStatus.color}`}>{lockStatus.status}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Unlock Date:</span>
                                <span className="ml-2">{unlockDate.toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Lock Address:</span>
                                <span className="ml-2 font-mono">{lock.pda.slice(0, 8)}...{lock.pda.slice(-8)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* NGO Management */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-purple-400">NGO Management</h2>
                
                <div className="space-y-4">
                  {!isNgoRegistryInitialized ? (
                    <div>
                      <p className="mb-4">Initialize the NGO registry to start adding organizations</p>
                      <button
                        onClick={initializeNgoRegistry}
                        disabled={loading.initNgo || !isInitialized}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                      >
                        {loading.initNgo ? "Initializing..." : "Initialize NGO Registry"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">NGO Name</label>
                        <input
                          type="text"
                          value={addNgoForm.name}
                          onChange={(e) => setAddNgoForm({...addNgoForm, name: e.target.value})}
                          placeholder="Organization Name"
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Treasury Address</label>
                        <input
                          type="text"
                          value={addNgoForm.treasury}
                          onChange={(e) => setAddNgoForm({...addNgoForm, treasury: e.target.value})}
                          placeholder={publicKey?.toString()}
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Treasury Type</label>
                        <select
                          value={addNgoForm.treasuryType}
                          onChange={(e) => setAddNgoForm({...addNgoForm, treasuryType: e.target.value})}
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                        >
                          <option value="Wallet">Wallet</option>
                          <option value="TokenAccount">Token Account</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={addNgoForm.description}
                          onChange={(e) => setAddNgoForm({...addNgoForm, description: e.target.value})}
                          placeholder="Organization description"
                          className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={addNgo}
                        disabled={loading.addNgo}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                      >
                        {loading.addNgo ? "Adding NGO..." : "Add NGO"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Config Management */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Update Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">New Admin (optional)</label>
                    <input
                      type="text"
                      value={updateConfigForm.newAdmin}
                      onChange={(e) => setUpdateConfigForm({...updateConfigForm, newAdmin: e.target.value})}
                      placeholder={configData?.admin.toString() || publicKey?.toString()}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Upgrade Authority (optional)</label>
                    <input
                      type="text"
                      value={updateConfigForm.newUpgradeAuthority}
                      onChange={(e) => setUpdateConfigForm({...updateConfigForm, newUpgradeAuthority: e.target.value})}
                      placeholder={configData?.upgradeAuthority.toString() || publicKey?.toString()}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Donation % (1-100, optional)</label>
                    <input
                      type="number"
                      value={updateConfigForm.newDonationPercentage}
                      onChange={(e) => setUpdateConfigForm({...updateConfigForm, newDonationPercentage: e.target.value})}
                      min="1"
                      max="100"
                      placeholder={configData?.donationPercentage || "10"}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New NGO Treasury (optional)</label>
                    <input
                      type="text"
                      value={updateConfigForm.newNgoTreasury}
                      onChange={(e) => setUpdateConfigForm({...updateConfigForm, newNgoTreasury: e.target.value})}
                      placeholder={configData?.ngo_treasury?.toString() || publicKey?.toString()}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <button
                    onClick={updateConfig}
                    disabled={loading.updateConfig || !isInitialized}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                    {loading.updateConfig ? "Updating..." : "Update Config"}
                  </button>
                </div>
              </div>
            </div>

            {/* User Charity Profile Section */}
            <div className="col-span-1 lg:col-span-3 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-300">🏆 Your Charity Profile</h2>
                
                {!charityProfileInitialized ? (
                  <div className="text-center py-8">
                    <p className="text-gray-300 mb-4">Your charity profile is not initialized yet.</p>
                    <p className="text-sm text-gray-400 mb-6">
                      Initialize your profile to start tracking your lifetime charitable donations!
                    </p>
                    <button
                      onClick={initializeUserCharityProfile}
                      disabled={charityLoading.initialize || !isInitialized}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-colors"
                    >
                      {charityLoading.initialize ? "Initializing..." : "🚀 Initialize Charity Profile"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-purple-200">Lifetime Impact</h3>
                      <button
                        onClick={fetchUserCharityProfile}
                        disabled={charityLoading.fetch}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        {charityLoading.fetch ? "Refreshing..." : "🔄 Refresh"}
                      </button>
                    </div>

                    {userCharityProfile ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-green-600/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-400 mb-2">
                            {formatUsdAmount(userCharityProfile.totalDonationsUsd)}
                          </div>
                          <div className="text-sm text-gray-300">Total Donated</div>
                        </div>
                        
                        <div className="bg-blue-600/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-2">
                            {userCharityProfile.totalDonationsCount}
                          </div>
                          <div className="text-sm text-gray-300">Donations Made</div>
                        </div>
                        
                        <div className="bg-purple-600/20 rounded-lg p-4 text-center">
                          <div className="text-sm font-semibold text-purple-400 mb-2">
                            Last Donation
                          </div>
                          <div className="text-xs text-gray-300">
                            {formatTimestamp(userCharityProfile.lastDonationTimestamp)}
                          </div>
                        </div>
                        
                        <div className="bg-yellow-600/20 rounded-lg p-4 text-center">
                          <div className="text-sm font-semibold text-yellow-400 mb-2">
                            Favorite NGO
                          </div>
                          <div className="text-xs text-gray-300 font-mono">
                            {userCharityProfile.favoriteNgo 
                              ? `${userCharityProfile.favoriteNgo.slice(0, 8)}...${userCharityProfile.favoriteNgo.slice(-8)}`
                              : "None yet"
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Loading charity profile data...</p>
                      </div>
                    )}

                    {/* Charity Profile Actions */}
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <h4 className="text-lg font-semibold text-purple-200 mb-4">Profile Actions</h4>
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={fetchUserCharityProfile}
                          disabled={charityLoading.fetch}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
                        >
                          {charityLoading.fetch ? "Loading..." : "📊 View Charity Data"}
                        </button>
                        
                        <div className="text-sm text-gray-400 py-2">
                          💡 Tip: Lock LST tokens with donation percentages to increase your charity impact!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Connection Status */}
        {connected && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Program ID: {PROGRAM_ID.toString().slice(0, 8)}...{PROGRAM_ID.toString().slice(-8)}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Network: {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "Localnet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 