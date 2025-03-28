import { useState, useEffect, FormEvent, FC } from "react";
import useCurrencyOptions from "./useCurrencyOptions";
import {
  NODES_WITH_RELAY_CHAINS,
  NODES_WITH_RELAY_CHAINS_DOT_KSM,
  TAsset,
  TNodeDotKsmWithRelayChains,
  TNodeWithRelayChains,
} from "@paraspell/sdk";
import { EXCHANGE_NODES, TExchangeNode } from "@paraspell/xcm-router";

export type FormValues = {
  from?: TNodeDotKsmWithRelayChains;
  exchange: TExchangeNode[];
  to?: TNodeWithRelayChains;
  currencyFromOptionId: string;
  currencyToOptionId: string;
  recipientAddress: string;
  amount: string;
  slippagePct: string;
  currencyFrom: TAsset;
  currencyTo: TAsset;
};

type Props = {
  onSubmit: (values: FormValues) => void;
  loading: boolean;
};

const TransferForm: FC<Props> = ({ onSubmit, loading }) => {
  // Prepare states for the form fields (origin and destination can be undefined)
  const [originNode, setOriginNode] = useState<
    TNodeDotKsmWithRelayChains | undefined
  >("Astar");
  const [destinationNode, setDestinationNode] = useState<
    TNodeWithRelayChains | undefined
  >("BifrostPolkadot");
  const [exchangeNode, setExchangeNode] = useState<TExchangeNode[]>([
    "HydrationDex",
  ]);
  const [currencyFromOptionId, setCurrencyFromOptionId] =
    useState("ASTR-NO_ID");
  const [currencyToOptionId, setCurrencyToOptionId] = useState("DOT-5");
  const [recipientAddress, setRecipientAddress] = useState(
    "5F5586mfsnM6durWRLptYt3jSUs55KEmahdodQ5tQMr9iY96"
  );
  const [amount, setAmount] = useState("10000000000000000000");

  // Get currency options based on the selected nodes
  const {
    currencyFromOptions,
    currencyFromMap,
    currencyToOptions,
    currencyToMap,
  } = useCurrencyOptions(originNode, exchangeNode, destinationNode);

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const transformedValues: FormValues = {
      from: originNode,
      exchange: exchangeNode,
      to: destinationNode,
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
    // If currencyFromMap has keys, set the first one as default
    const keys = Object.keys(currencyFromMap);
    if (keys.length > 0) {
      setCurrencyFromOptionId(keys[0]);
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
        Origin node
        <select
          value={originNode ?? ""}
          onChange={(e) =>
            setOriginNode(
              e.target.value === ""
                ? undefined
                : (e.target.value as TNodeDotKsmWithRelayChains)
            )
          }
        >
          <option value="">None</option>
          {NODES_WITH_RELAY_CHAINS_DOT_KSM.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </label>

      <label>
        Exchange node
        <select
          multiple
          value={exchangeNode}
          onChange={(e) => {
            const selectedOptions = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setExchangeNode(selectedOptions as TExchangeNode[]);
          }}
          required
        >
          {EXCHANGE_NODES.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </label>

      <label>
        Destination node
        <select
          value={destinationNode ?? ""}
          onChange={(e) =>
            setDestinationNode(
              e.target.value === ""
                ? undefined
                : (e.target.value as TNodeWithRelayChains)
            )
          }
        >
          <option value="">None</option>
          {NODES_WITH_RELAY_CHAINS.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </label>

      <label>
        Currency From
        <select
          key={`${originNode?.toString()}${exchangeNode?.toString()}${destinationNode?.toString()}currencyFrom`}
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
          key={`${originNode?.toString()}${exchangeNode?.toString()}${destinationNode?.toString()}currencyTo`}
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
