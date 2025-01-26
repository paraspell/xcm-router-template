import { useState } from "react";
import TransferForm from "./XcmTransferForm";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import type { FormValues } from "./XcmTransferForm";
import type { Signer } from "@polkadot/api/types";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import {
  RouterBuilder,
  TransactionType,
  TTxProgressInfo,
} from "@paraspell/xcm-router";
import { ethers } from "ethers";

// Return status message based on the current routing status
const getStatusMessage = (status?: TTxProgressInfo) => {
  if (!status) {
    return "";
  }
  if (status.type === TransactionType.TO_EXCHANGE) {
    return "Sending to exchange...";
  } else if (status.type === TransactionType.SWAP) {
    return "Swapping...";
  } else if (status.type === TransactionType.TO_DESTINATION) {
    return "Sending to destination...";
  } else {
    return "Processing...";
  }
};

const XcmTransfer = () => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [evmAccounts, setEvmAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();
  const [selectedEvmAccount, setSelectedEvmAccount] =
    useState<InjectedAccountWithMeta>();
  const [progressInfo, setProgressInfo] = useState<TTxProgressInfo>();

  // Initialize the wallet extension and get all accounts
  const initExtension = async () => {
    const allInjected = await web3Enable("ParaSpellXcmSdk");

    if (!allInjected) {
      alert("No wallet extension found, install it to connect");
      throw Error("No Wallet Extension Found!");
    }
  };

  // Get all accounts from the wallet extension
  const initAccounts = async () => {
    await initExtension();

    // Get all accounts
    const allAccounts = await web3Accounts();

    if (allAccounts.length === 0) {
      alert("No accounts found, create or import an account to connect");
      throw Error("No Accounts Found!");
    }

    // Save accounts to state
    setAccounts(allAccounts);

    // Set the first account as selected
    setSelectedAccount(allAccounts[0]);
  };

  // Get all EVM accounts from the wallet extension
  const initEvmAccounts = async () => {
    await initExtension();

    // Get all accounts
    const allAccounts = await web3Accounts();

    if (allAccounts.length === 0) {
      alert("No accounts found, create or import an account to connect");
      throw Error("No Accounts Found!");
    }

    const filteredAccounts = allAccounts.filter((account) =>
      ethers.isAddress(account.address)
    );

    // Save accounts to state
    setEvmAccounts(filteredAccounts);

    // Set the first account as selected
    setSelectedEvmAccount(filteredAccounts[0]);
  };

  // Update the progress info state
  const onStatusChange = (status: TTxProgressInfo) => {
    setProgressInfo(status);
  };

  // Create a transaction using the Router module and submit it
  const submitUsingRouterModule = async (
    values: FormValues,
    injectorAddress: string,
    signer: Signer,
    evmInjectorAddress?: string,
    evmSigner?: Signer
  ) => {
    const {
      from,
      to,
      currencyFrom,
      currencyTo,
      amount,
      recipientAddress,
      slippagePct,
      transactionType,
    } = values;

    // Get the exchange if it's not set to auto select
    const exchange =
      values.exchange === "Auto select" ? undefined : values.exchange;

    // Create the RouterBuilder instance
    // and build the transaction
    return RouterBuilder()
      .from(from)
      .to(to)
      .exchange(exchange)
      .currencyFrom(
        currencyFrom.assetId
          ? { id: currencyFrom.assetId }
          : { symbol: currencyFrom.symbol ?? "" }
      )
      .currencyTo(
        currencyTo.assetId
          ? { id: currencyTo.assetId }
          : { symbol: currencyTo.symbol ?? "" }
      )
      .amount(amount)
      .injectorAddress(injectorAddress)
      .recipientAddress(recipientAddress)
      .evmInjectorAddress(evmInjectorAddress)
      .assetHubAddress("")
      .signer(signer)
      .ethSigner(undefined)
      .evmSigner(evmSigner)
      .slippagePct(slippagePct)
      .transactionType(TransactionType[transactionType])
      .onStatusChange(onStatusChange)
      .build();
  };

  // Called when the form is submitted
  const onSubmit = async (formValues: FormValues) => {
    if (!selectedAccount) {
      alert("No account selected, connect wallet first");
      return;
    }

    setLoading(true);

    // Get the injector for the selected account
    const injector = await web3FromAddress(selectedAccount.address);

    // Get the EVM injector for the selected EVM account
    const evmInjector = selectedEvmAccount
      ? await web3FromAddress(selectedEvmAccount.address)
      : undefined;

    try {
      // Create the transaction using the SDK and submit it
      await submitUsingRouterModule(
        formValues,
        selectedAccount.address,
        injector.signer,
        selectedEvmAccount?.address,
        evmInjector?.signer
      );
      alert("Transaction was successful!");
    } catch (e) {
      // Handle errors
      setError(e as Error);
      setErrorVisible(true);
      setProgressInfo(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="formHeader">
        <div className="wallets">
          {accounts.length > 0 ? (
            <div>
              <div>
                <h4>Connected to:</h4>
              </div>
              <select
                style={{}}
                value={selectedAccount?.address}
                onChange={(e) =>
                  setSelectedAccount(
                    accounts.find((acc) => acc.address === e.target.value)
                  )
                }
              >
                {accounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.meta.name} - {acc.address}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button className="connectWallet" onClick={initAccounts}>
              Connect Wallet
            </button>
          )}
        </div>
        <div>
          {evmAccounts.length > 0 ? (
            <div>
              <h4>EVM Accounts</h4>
              <select
                value={selectedEvmAccount?.address}
                onChange={(e) =>
                  setSelectedEvmAccount(
                    evmAccounts.find((acc) => acc.address === e.target.value)
                  )
                }
              >
                {evmAccounts.map((acc) => (
                  <option key={acc.address} value={acc.address}>
                    {acc.meta.name} - {acc.address}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button className="connectWallet" onClick={initEvmAccounts}>
              Connect EVM wallet
            </button>
          )}
        </div>
      </div>
      <TransferForm onSubmit={onSubmit} loading={loading} />
      <div className="statusMessage">{getStatusMessage(progressInfo)}</div>
      <div>{errorVisible && <p>{error?.message}</p>}</div>
    </div>
  );
};

export default XcmTransfer;
