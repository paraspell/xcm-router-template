import { useState, useEffect, FormEvent, FC } from "react";
import useCurrencyOptions from "./useCurrencyOptions";
import {
  CHAINS,
  SUBSTRATE_CHAINS,
  TAssetInfo,
  TChain,
  TSubstrateChain,
} from "@paraspell/sdk";
import { EXCHANGE_CHAINS, TExchangeChain } from "@paraspell/xcm-router";

export type FormValues = {
  from?: TSubstrateChain;
  exchange: TExchangeChain[];
  to?: TChain;
  currencyFromOptionId: string;
  currencyToOptionId: string;
  recipientAddress: string;
  amount: string;
  slippagePct: string;
  currencyFrom: TAssetInfo;
  currencyTo: TAssetInfo;
};

type Props = {
  onSubmit: (values: FormValues) => void;
  loading: boolean;
};

const TransferForm: FC<Props> = ({ onSubmit, loading }) => {
  // Prepare states for the form fields (origin and destination can be undefined)
  const [originChain, setOriginChain] = useState<TSubstrateChain | undefined>(
    "Astar"
  );
  const [destChain, setDestChain] = useState<TChain | undefined>(
    "BifrostPolkadot"
  );
  const [exchangeChain, setExchangeChain] = useState<TExchangeChain[]>([
    "HydrationDex",
  ]);
  const [currencyFromOptionId, setCurrencyFromOptionId] = useState("");
  const [currencyToOptionId, setCurrencyToOptionId] = useState("");
  const [recipientAddress, setRecipientAddress] = useState(
    "5F5586mfsnM6durWRLptYt3jSUs55KEmahdodQ5tQMr9iY96"
  );
  const [amount, setAmount] = useState("1000000000000000000000000");

  // Get currency options based on the selected chains
  const {
    currencyFromOptions,
    currencyFromMap,
    currencyToOptions,
    currencyToMap,
  } = useCurrencyOptions(originChain, exchangeChain, destChain);

  console.log("Currency From Options:", currencyFromOptions);

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const transformedValues: FormValues = {
      from: originChain,
      exchange: exchangeChain,
      to: destChain,
      currencyFromOptionId,
      currencyToOptionId,
      recipientAddress,
      amount,
      slippagePct: "1",
      currencyFrom: currencyFromMap[currencyFromOptionId],
      currencyTo: currencyToMap[currencyToOptionId],
    };

    onSubmit(transformedValues);
  };

  useEffect(() => {
    // If currencyFromMap has keys, set the last one as default
    const keys = Object.keys(currencyFromMap);
    if (keys.length > 0) {
      setCurrencyFromOptionId(keys[keys.length - 1]);
    }
  }, [currencyFromMap]);

  useEffect(() => {
    // If currencyToMap has keys, set the first one as default
    const keys = Object.keys(currencyToMap);
    if (keys.length > 0) {
      setCurrencyToOptionId(keys[0]);
    }
  }, [currencyToMap]);

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Origin chain
        <select
          value={originChain ?? ""}
          onChange={(e) =>
            setOriginChain(
              e.target.value === ""
                ? undefined
                : (e.target.value as TSubstrateChain)
            )
          }
        >
          <option value="">None</option>
          {SUBSTRATE_CHAINS.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </label>

      <label>
        Exchange chain
        <select
          multiple
          value={exchangeChain}
          onChange={(e) => {
            const selectedOptions = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setExchangeChain(selectedOptions as TExchangeChain[]);
          }}
          required
        >
          {EXCHANGE_CHAINS.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </label>

      <label>
        Destination chain
        <select
          value={destChain ?? ""}
          onChange={(e) =>
            setDestChain(
              e.target.value === "" ? undefined : (e.target.value as TChain)
            )
          }
        >
          <option value="">None</option>
          {CHAINS.map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
      </label>

      <label>
        Currency From
        <select
          key={`${originChain?.toString()}${exchangeChain?.toString()}${destChain?.toString()}currencyFrom`}
          value={currencyFromOptionId}
          onChange={(e) => setCurrencyFromOptionId(e.target.value)}
          required
        >
          {currencyFromOptions.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Currency To
        <select
          key={`${originChain?.toString()}${exchangeChain?.toString()}${destChain?.toString()}currencyTo`}
          value={currencyToOptionId}
          onChange={(e) => setCurrencyToOptionId(e.target.value)}
          required
        >
          {currencyToOptions.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Recipient address
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          required
        />
      </label>

      <label>
        Amount
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit transaction"}
      </button>
    </form>
  );
};

export default TransferForm;
