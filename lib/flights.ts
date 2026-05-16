export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  logo: string;
  from: string;
  to: string;
  departure: string;
  duration: string;
  price: number;
  stops: string;
}

export const flights: Flight[] = [
  {
    id: "6E-201",
    airline: "IndiGo",
    flightNumber: "6E-201",
    logo: "6E",
    from: "Bangalore",
    to: "Patna",
    departure: "6:00 AM",
    duration: "2h 10m",
    price: 4999,
    stops: "Non-stop",
  },
  {
    id: "AI-402",
    airline: "Air India",
    flightNumber: "AI-402",
    logo: "AI",
    from: "Bangalore",
    to: "Patna",
    departure: "9:30 AM",
    duration: "2h 30m",
    price: 6499,
    stops: "Non-stop",
  },
  {
    id: "SG-115",
    airline: "SpiceJet",
    flightNumber: "SG-115",
    logo: "SG",
    from: "Bangalore",
    to: "Patna",
    departure: "1:15 PM",
    duration: "2h 20m",
    price: 3799,
    stops: "Non-stop",
  },
  {
    id: "UK-801",
    airline: "Vistara",
    flightNumber: "UK-801",
    logo: "UK",
    from: "Bangalore",
    to: "Patna",
    departure: "6:45 PM",
    duration: "2h 05m",
    price: 8999,
    stops: "Non-stop",
  },
];
