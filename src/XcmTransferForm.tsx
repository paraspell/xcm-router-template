import { useState, useEffect, FormEvent, FC } from "react";
import useCurrencyOptions from "./useCurrencyOptions";
import {
  NODES_WITH_RELAY_CHAINS,
  TAsset,
  TNodeWithRelayChains,
} from "@paraspell/sdk";
import {
  EXCHANGE_NODES,
  TAutoSelect,
  TExchangeNode,
  TransactionType,
} from "@paraspell/xcm-router";

export type FormValues = {
  from: TNodeWithRelayChains;
  exchange: TExchangeNode | TAutoSelect;
  to: TNodeWithRelayChains;
  currencyFromOptionId: string;
  currencyToOptionId: string;
  recipientAddress: string;
  amount: string;
  slippagePct: string;
  transactionType: keyof typeof TransactionType;
  currencyFrom: TAsset;
  currencyTo: TAsset;
};

type Props = {
  onSubmit: (values: FormValues) => void;
  loading: boolean;
};

const TransferForm: FC<Props> = ({ onSubmit, loading }) => {
  // Prepare states for the form fields
  const [originNode, setOriginNode] = useState<TNodeWithRelayChains>("Astar");
  const [destinationNode, setDestinationNode] =
    useState<TNodeWithRelayChains>("BifrostPolkadot");
  const [exchangeNode, setExchangeNode] = useState<TExchangeNode | TAutoSelect>(
    "HydrationDex"
  );
  const [currencyFromOptionId, setCurrencyFromOptionId] = useState("ASTR-1333");
  const [currencyToOptionId, setCurrencyToOptionId] = useState("DOT-NO_ID");
  const [recipientAddress, setRecipientAddress] = useState(
    "5F5586mfsnM6durWRLptYt3jSUs55KEmahdodQ5tQMr9iY96"
  );
  const [amount, setAmount] = useState("10000000000000000000");
  const [transactionType, setTransactionType] = useState<
    keyof typeof TransactionType
  >(TransactionType.FULL_TRANSFER);

  // Get currency options based on the selected nodes
  const {
    currencyFromOptions,
    currencyFromMap,
    currencyToOptions,
    currencyToMap,
    isFromNotParaToPara,
    isToNotParaToPara,
  } = useCurrencyOptions(originNode, exchangeNode, destinationNode);

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const transformedValues = {
      from: originNode,
      exchange: exchangeNode,
      to: destinationNode,
      currencyFromOptionId,
      currencyToOptionId,
      recipientAddress,
      amount,
      slippagePct: "1",
      transactionType,
      currencyFrom: currencyFromMap[currencyFromOptionId],
      currencyTo: currencyToMap[currencyToOptionId],
    };

    // Pass the submitted form values to the parent component
    onSubmit(transformedValues);
  };

  useEffect(() => {
    if (isFromNotParaToPara) {
      setCurrencyFromOptionId(Object.keys(currencyFromMap)[0]);
    }
  }, [currencyFromMap]);

  useEffect(() => {
    if (isToNotParaToPara) {
      setCurrencyToOptionId(Object.keys(currencyToMap)[0]);
    }
  }, [currencyToMap]);

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Origin node
        <select
          value={originNode}
          onChange={(e) =>
            setOriginNode(e.target.value as TNodeWithRelayChains)
          }
          required
        >
          {NODES_WITH_RELAY_CHAINS.map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </label>

      <label>
        Exchange node
        <select
          value={exchangeNode}
          onChange={(e) => setExchangeNode(e.target.value as TExchangeNode)}
          required
        >
          {["Auto select", ...EXCHANGE_NODES].map((node) => (
            <option key={node} value={node}>
              {node}
            </option>
          ))}
        </select>
      </label>

      <label>
        Destination node
        <select
          value={destinationNode}
          onChange={(e) =>
            setDestinationNode(e.target.value as TNodeWithRelayChains)
          }
          required
        >
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
          key={originNode + exchangeNode + destinationNode + "currencyFrom"}
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
          key={originNode + exchangeNode + destinationNode + "currencyTo"}
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

      <label>
        Transaction type
        <select
          value={transactionType}
          onChange={(e) =>
            setTransactionType(e.target.value as keyof typeof TransactionType)
          }
          required
        >
          {Object.keys(TransactionType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit transaction"}
      </button>
    </form>
  );
};

export default TransferForm;
