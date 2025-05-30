import { useState } from "react";
import TransferForm from "./XcmTransferForm";
import {
  connectInjectedExtension,
  getInjectedExtensions,
  InjectedExtension,
  InjectedPolkadotAccount,
  PolkadotSigner,
} from "polkadot-api/pjs-signer";
import type { FormValues } from "./XcmTransferForm";
import {
  RouterBuilder,
  TExchangeInput,
  TRouterEvent,
} from "@paraspell/xcm-router";
import { TAsset, TCurrencyInput } from "@paraspell/sdk";
import { isAddress } from "viem";

// Return status message based on the current routing status
const getStatusMessage = (status?: TRouterEvent) => {
  if (!status) {
    return "";
  }
  if (status.type === "TRANSFER") {
    return `Transfering tokens from ${status.node} to ${status.destinationNode}...`;
  } else if (status.type === "SWAP") {
    return "Swapping tokens ...";
  } else if (status.type === "SWAP_AND_TRANSFER") {
    return `Swapping tokens and transfering them from ${status.node} to ${status.destinationNode}...`;
  } else if (status.type === "SELECTING_EXCHANGE") {
    return "Picking the best exchange...";
  } else {
    return "Processing...";
  }
};

const XcmTransfer = () => {
  const [errorVisible, setErrorVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [extensions, setExtensions] = useState<string[]>([]);
  const [selectedExtension, setSelectedExtension] =
    useState<InjectedExtension | null>(null);
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedPolkadotAccount>();
  const [evmAccounts, setEvmAccounts] = useState<InjectedPolkadotAccount[]>([]);
  const [selectedEvmAccount, setSelectedEvmAccount] =
    useState<InjectedPolkadotAccount>();
  const [progressInfo, setProgressInfo] = useState<TRouterEvent>();

  // Get all accounts from the wallet extension
  const initAccounts = async () => {
    const exts = getInjectedExtensions();
    if (exts.length === 0) {
      alert("No wallet extension found, please install one.");
      throw Error("No Wallet Extension Found!");
    }
    setExtensions(exts);
  };

  // Update the progress info state
  const onStatusChange = (status: TRouterEvent) => {
    setProgressInfo(status);
  };

  const onExtensionSelect = async (name: string) => {
    const injectedExtension = await connectInjectedExtension(name);
    setSelectedExtension(injectedExtension);

    // Get the accounts from the selected extension
    const accounts = injectedExtension.getAccounts();

    // Filter and set only non-EVM accounts
    setAccounts(accounts.filter((account) => !isAddress(account.address)));

    // Filter and set only EVM accounts
    setEvmAccounts(accounts.filter((account) => isAddress(account.address)));
  };

  // Create a transaction using the Router module and submit it
  const submitUsingRouterModule = async (
    values: FormValues,
    senderAddress: string,
    signer: PolkadotSigner,
    evmSenderAddress?: string,
    evmSigner?: PolkadotSigner
  ) => {
    const {
      from,
      to,
      currencyFrom,
      currencyTo,
      amount,
      recipientAddress,
      slippagePct,
    } = values;

    // Transform exchange so that when its only one items it is not an array
    const exchange =
      values.exchange.length > 1 ? values.exchange : values.exchange[0];

    const determineCurrency = (asset: TAsset): TCurrencyInput => {
      if (asset.multiLocation) {
        return { multilocation: asset.multiLocation };
      } else if ("assetId" in asset && asset.assetId) {
        return { id: asset.assetId };
      }
      return { symbol: asset.symbol ?? "" };
    };

    // Create the RouterBuilder instance
    // and build the transaction
    return RouterBuilder()
      .from(from)
      .to(to)
      .exchange(exchange as TExchangeInput)
      .currencyFrom(determineCurrency(currencyFrom))
      .currencyTo(determineCurrency(currencyTo))
      .amount(amount)
      .senderAddress(senderAddress)
      .recipientAddress(recipientAddress)
      .evmSenderAddress(evmSenderAddress)
      .signer(signer)
      .evmSigner(evmSigner)
      .slippagePct(slippagePct)
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
    const signer = selectedAccount.polkadotSigner;
    const evmSigner = selectedEvmAccount?.polkadotSigner;

    try {
      // Create the transaction using the SDK and submit it
      await submitUsingRouterModule(
        formValues,
        selectedAccount.address,
        signer,
        selectedEvmAccount?.address,
        evmSigner
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
        {extensions.length > 0 ? (
          <div>
            <h4>Select extension:</h4>
            <select
              defaultValue=""
              value={selectedExtension?.name}
              onChange={(e) => onExtensionSelect(e.target.value)}
            >
              <option disabled value="">
                -- select an option --
              </option>
              {extensions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <button onClick={initAccounts}>Connect Wallet</button>
        )}
        {accounts.length > 0 && (
          <div>
            <div>
              <h4>Select account:</h4>
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
              {accounts.map(({ name, address }) => (
                <option key={address} value={address}>
                  {name} - {address}
                </option>
              ))}
            </select>
          </div>
        )}
        {evmAccounts.length > 0 && (
          <div>
            <div>
              <h4>Select EVM account:</h4>
            </div>
            <select
              style={{}}
              value={selectedEvmAccount?.address}
              onChange={(e) =>
                setSelectedEvmAccount(
                  evmAccounts.find((acc) => acc.address === e.target.value)
                )
              }
            >
              {evmAccounts.map(({ name, address }) => (
                <option key={address} value={address}>
                  {name} - {address}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <TransferForm onSubmit={onSubmit} loading={loading} />
      <div className="statusMessage">{getStatusMessage(progressInfo)}</div>
      <div>{errorVisible && <p>{error?.message}</p>}</div>
    </div>
  );
};

export default XcmTransfer;
