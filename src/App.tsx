import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Home, Smartphone, IndianRupee, Users, PlusCircle,
  Save, Search, ArrowLeft, ShoppingCart, Package, TrendingUp,
  TrendingDown, Clock, ChevronRight, RefreshCw, Trash2,
  UserPlus, Receipt, FileText, Lock, Unlock, Send, Camera, X
} from 'lucide-react';
import { supabase } from './lib/supabase';

// ===========================
// TYPES
// ===========================
interface PhoneRecord {
  id?: string;
  brand: string;
  model: string;
  imei: string;
  storage_ram: string;
  colour: string;
  status: string;
  purchase_price: number;
  sell_price: number;
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  buyer_aadhar: string;
  bill_photo_url: string;
  created_at?: string;
}

interface Transaction {
  id?: string;
  type: string;
  amount: number;
  description: string;
  phone_id?: string | null;
  created_at?: string;
}

interface Client {
  id?: string;
  name: string;
  phone_number: string;
  address: string;
  aadhar_no: string;
  due_payment: number;
  created_at?: string;
}

interface GirwiRecord {
  id?: string;
  customer_name: string;
  customer_phone: string;
  phone_brand: string;
  phone_model: string;
  imei: string;
  price: number;
  interest_rate: number;
  days: number;
  start_date: string;
  status: string; // active | redeemed
  created_at?: string;
}

// ===========================
// REUSABLE COMPONENTS
// ===========================
const BackHeader = ({ title, onBack }: { title: string; onBack?: () => void }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center space-x-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
      <button onClick={onBack || (() => navigate(-1))} className="p-1">
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <Package className="w-16 h-16 mb-3 opacity-50" />
    <p className="text-sm">{message}</p>
  </div>
);

// ===========================
// PAGE: DASHBOARD
// ===========================
const Dashboard = () => {
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [girwiList, setGirwiList] = useState<GirwiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [phonesRes, txRes, clientsRes, girwiRes] = await Promise.all([
      supabase.from('phones').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('girwi').select('*'),
    ]);
    setPhones(phonesRes.data || []);
    setTransactions(txRes.data || []);
    setClients(clientsRes.data || []);
    setGirwiList(girwiRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSpinner />;

  const readyPhones = phones.filter(p => p.status === 'ready');
  const repairPending = phones.filter(p => p.status === 'repair_pending');
  const soldPhones = phones.filter(p => p.status === 'sold');

  const moneyInvested = phones.reduce((s, p) => s + (p.purchase_price || 0), 0);
  const moneyReceived = soldPhones.reduce((s, p) => s + (p.sell_price || 0), 0);
  const moneyPending = clients.reduce((s, c) => s + (c.due_payment || 0), 0);
  const soldCost = soldPhones.reduce((s, p) => s + (p.purchase_price || 0), 0);
  const profit = moneyReceived - soldCost;

  const dueClients = clients.filter(c => c.due_payment > 0).length;

  const today = new Date().toISOString().split('T')[0];
  const todayTx = transactions.filter(t => (t.created_at || '').startsWith(today));
  const todaySell = todayTx.filter(t => t.type === 'sell').reduce((s, t) => s + t.amount, 0);
  const todayPurchase = todayTx.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0);
  const todayInvest = todayTx.filter(t => t.type === 'invest').reduce((s, t) => s + t.amount, 0);
  const todayLoss = todayTx.filter(t => t.type === 'loss').reduce((s, t) => s + t.amount, 0);

  const brands = ['Oppo', 'Vivo', 'Samsung', 'Realme', 'Redmi', 'Poco', 'Iphone', 'Iq', 'Google Pixel'];

  return (
    <div className="pb-24 min-h-screen page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-5 pb-10 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">📱 Goswami Mobile</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={fetchData} className="bg-white/20 p-2.5 rounded-full active:scale-95 transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold">{phones.length}</p>
            <p className="text-[11px] text-blue-100 font-medium">Total Phone</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-green-300">{readyPhones.length}</p>
            <p className="text-[11px] text-blue-100 font-medium">Ready</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-yellow-300">{repairPending.length}</p>
            <p className="text-[11px] text-blue-100 font-medium">Repair Pending</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-4">
        {/* Financial Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-red-50 p-1.5 rounded-lg"><TrendingDown className="w-4 h-4 text-red-500" /></div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Invested</p>
            </div>
            <p className="text-lg font-bold text-gray-900">₹{moneyInvested.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-green-50 p-1.5 rounded-lg"><TrendingUp className="w-4 h-4 text-green-500" /></div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Received</p>
            </div>
            <p className="text-lg font-bold text-gray-900">₹{moneyReceived.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-yellow-50 p-1.5 rounded-lg"><Clock className="w-4 h-4 text-yellow-500" /></div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Pending</p>
            </div>
            <p className="text-lg font-bold text-gray-900">₹{moneyPending.toLocaleString('en-IN')}</p>
          </div>
          <div className={`bg-white p-4 rounded-2xl shadow-sm border ${profit >= 0 ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className={`${profit >= 0 ? 'bg-green-50' : 'bg-red-50'} p-1.5 rounded-lg`}>
                {profit >= 0
                  ? <TrendingUp className="w-4 h-4 text-green-600" />
                  : <TrendingDown className="w-4 h-4 text-red-600" />}
              </div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{profit >= 0 ? 'Profit' : 'Loss'}</p>
            </div>
            <p className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(profit).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Clients Card */}
        <button onClick={() => navigate('/clients')} className="w-full bg-white rounded-2xl shadow-sm p-4 border border-gray-100 text-left active:scale-[0.98] transition">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2.5 rounded-xl"><Users className="text-purple-600 w-5 h-5" /></div>
              <div>
                <p className="font-semibold text-gray-800">Total Clients: {clients.length}</p>
                <p className="text-xs text-red-500 font-medium">{dueClients} Due Payment</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        {/* Today's Hisab */}
        <button onClick={() => navigate('/hisab')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-md p-4 text-white text-left active:scale-[0.98] transition">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-base">📒 Daily Hisab</h3>
            <ChevronRight className="w-5 h-5 opacity-80" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/15 rounded-xl p-2 text-center">
              <p className="text-sm font-bold">₹{todaySell.toLocaleString('en-IN')}</p>
              <p className="text-[10px] opacity-90">Sell</p>
            </div>
            <div className="bg-white/15 rounded-xl p-2 text-center">
              <p className="text-sm font-bold">₹{todayPurchase.toLocaleString('en-IN')}</p>
              <p className="text-[10px] opacity-90">Purchase</p>
            </div>
            <div className="bg-white/15 rounded-xl p-2 text-center">
              <p className="text-sm font-bold">₹{todayInvest.toLocaleString('en-IN')}</p>
              <p className="text-[10px] opacity-90">Invest</p>
            </div>
            <div className="bg-white/15 rounded-xl p-2 text-center">
              <p className="text-sm font-bold">₹{todayLoss.toLocaleString('en-IN')}</p>
              <p className="text-[10px] opacity-90">Loss</p>
            </div>
          </div>
        </button>

        {/* Girwi Card */}
        {(() => {
          const activeGirwi = girwiList.filter(g => g.status === 'active');
          const totalGirwiAmount = activeGirwi.reduce((s, g) => s + (g.price || 0), 0);
          return (
            <button onClick={() => navigate('/girwi')} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-md p-4 text-white text-left active:scale-[0.98] transition">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2.5 rounded-xl"><Lock className="w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-base">🔒 Girwi (गिरवी)</p>
                    <p className="text-xs text-amber-100">{activeGirwi.length} Active • ₹{totalGirwiAmount.toLocaleString('en-IN')} Total</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-80" />
              </div>
            </button>
          );
        })()}

        {/* Brand-wise Ready Phones */}
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-3">Ready Phones by Brand</h3>
          <div className="grid grid-cols-3 gap-2">
            {brands.map(brand => {
              const count = readyPhones.filter(p => p.brand === brand).length;
              return (
                <button key={brand} onClick={() => navigate(`/phones?brand=${brand}`)}
                  className="bg-white p-3 rounded-2xl shadow-sm text-center border border-gray-100 active:scale-95 transition">
                  <p className="text-xl font-bold text-blue-600">{count}</p>
                  <p className="text-[11px] text-gray-600 font-medium truncate">{brand}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================
// PAGE: PHONES LIST
// ===========================
const PhonesList = () => {
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const brands = ['All', 'Oppo', 'Vivo', 'Samsung', 'Realme', 'Redmi', 'Poco', 'Iphone', 'Iq', 'Google Pixel'];

  useEffect(() => {
    // Check URL params for initial brand filter
    const params = new URLSearchParams(window.location.search);
    const brand = params.get('brand');
    if (brand) setSelectedBrand(brand);
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    setLoading(true);
    const { data } = await supabase.from('phones').select('*').order('created_at', { ascending: false });
    setPhones(data || []);
    setLoading(false);
  };

  const filtered = phones.filter(p => {
    const brandMatch = selectedBrand === 'All' || p.brand === selectedBrand;
    const searchMatch = !searchTerm ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.imei.includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return brandMatch && searchMatch;
  });

  const statusColor: Record<string, string> = {
    ready: 'bg-green-100 text-green-700',
    repair_pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-gray-100 text-gray-600',
  };

  const statusLabel: Record<string, string> = {
    ready: 'Ready',
    repair_pending: 'Repair',
    sold: 'Sold',
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="p-4 pb-2">
          <h1 className="text-xl font-bold text-gray-800 mb-3">📱 Phone Stock</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search model, IMEI, brand..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex overflow-x-auto space-x-2 px-4 pb-3 no-scrollbar">
          {brands.map(b => (
            <button key={b} onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedBrand === b
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
              }`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No phones found" /> : (
        <div className="p-4 space-y-2">
          <p className="text-xs text-gray-500 font-medium">{filtered.length} phones found</p>
          {filtered.map(phone => (
            <button key={phone.id} onClick={() => navigate(`/phone/${phone.id}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center text-left active:scale-[0.98] transition">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-bold text-gray-800">{phone.brand}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor[phone.status] || 'bg-gray-100'}`}>
                    {statusLabel[phone.status] || phone.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{phone.model}</p>
                {phone.imei && <p className="text-[11px] text-gray-400 mt-0.5 font-mono">IMEI: {phone.imei}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">₹{(phone.purchase_price || 0).toLocaleString('en-IN')}</p>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===========================
// PAGE: ADD MENU (the + button)
// ===========================
const AddMenu = () => {
  const navigate = useNavigate();

  const items = [
    { icon: Package, label: 'Add New Phone', desc: 'Purchase / add to stock', path: '/add/phone', color: 'from-blue-500 to-indigo-600' },
    { icon: ShoppingCart, label: 'Sell Phone', desc: 'Sell a ready phone', path: '/sell', color: 'from-green-500 to-emerald-600' },
    { icon: Lock, label: 'Add Girwi (गिरवी)', desc: 'Mortgage / pawn a phone', path: '/add/girwi', color: 'from-amber-500 to-orange-600' },
    { icon: UserPlus, label: 'Add Client', desc: 'Register new client', path: '/add/client', color: 'from-purple-500 to-pink-600' },
    { icon: Receipt, label: 'Add Transaction', desc: 'Daily hisab entry', path: '/add/transaction', color: 'from-orange-500 to-red-500' },
    { icon: FileText, label: 'Generate Bill', desc: 'Create & share bill on WhatsApp', path: '/bill', color: 'from-teal-500 to-green-500' },
    { icon: Search, label: 'Phone Info (IMEI)', desc: 'Search by IMEI number', path: '/info', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Quick Actions" />
      <div className="p-4 space-y-3">
        {items.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="w-full flex items-center space-x-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition text-left">
            <div className={`bg-gradient-to-br ${item.color} p-3 rounded-xl shadow-sm`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===========================
// PAGE: ADD PHONE (with all Information fields)
// ===========================
const AddPhone = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    brand: 'Oppo', model: '', imei: '', storage_ram: '', colour: '',
    purchase_price: '', status: 'ready',
  });

  const brands = ['Oppo', 'Vivo', 'Samsung', 'Realme', 'Redmi', 'Poco', 'Iphone', 'Iq', 'Google Pixel'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('phones').insert([{
      brand: form.brand,
      model: form.model,
      imei: form.imei,
      storage_ram: form.storage_ram,
      colour: form.colour,
      purchase_price: parseFloat(form.purchase_price) || 0,
      sell_price: 0,
      status: form.status,
      buyer_name: '', buyer_phone: '', buyer_address: '', buyer_aadhar: '', bill_photo_url: '',
    }]);

    if (error) {
      alert('❌ Error: ' + error.message);
    } else {
      // Also add a "purchase" transaction
      await supabase.from('transactions').insert([{
        type: 'purchase',
        amount: parseFloat(form.purchase_price) || 0,
        description: `${form.brand} ${form.model} purchased`,
      }]);
      alert('✅ Phone added successfully!');
      navigate('/phones');
    }
    setLoading(false);
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Add New Phone" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Phone Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Brand *</label>
            <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Model Name *</label>
            <input type="text" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}
              placeholder="e.g. Reno 8, Galaxy A54" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">IMEI Number</label>
            <input type="text" value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })}
              placeholder="15-digit IMEI" maxLength={15}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Storage / RAM</label>
              <input type="text" value={form.storage_ram} onChange={e => setForm({ ...form, storage_ram: e.target.value })}
                placeholder="e.g. 6/128GB"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Colour</label>
              <input type="text" value={form.colour} onChange={e => setForm({ ...form, colour: e.target.value })}
                placeholder="e.g. Black"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Purchase Price (₹) *</label>
            <input type="number" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })}
              placeholder="0" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ready">✅ Ready to Sell</option>
              <option value="repair_pending">🔧 Repair Pending</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition disabled:opacity-50">
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Phone'}</span>
        </button>
      </form>
    </div>
  );
};

// ===========================
// PAGE: SELL PHONE
// ===========================
const SellPhone = () => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<PhoneRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sell_price: '', buyer_name: '', buyer_phone: '', buyer_address: '',
    buyer_aadhar: '', bill_photo_url: '',
  });
  const [billPreview, setBillPreview] = useState('');

  useEffect(() => {
    supabase.from('phones').select('*').eq('status', 'ready').order('created_at', { ascending: false })
      .then(({ data }) => { setPhones(data || []); setLoading(false); });
  }, []);

  const handleBillPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setBillPreview(base64);
      setForm(f => ({ ...f, bill_photo_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone) return;
    setSaving(true);

    const { error } = await supabase.from('phones').update({
      status: 'sold',
      sell_price: parseFloat(form.sell_price) || 0,
      buyer_name: form.buyer_name,
      buyer_phone: form.buyer_phone,
      buyer_address: form.buyer_address,
      buyer_aadhar: form.buyer_aadhar,
      bill_photo_url: form.bill_photo_url,
    }).eq('id', selectedPhone.id);

    if (error) {
      alert('❌ Error: ' + error.message);
    } else {
      await supabase.from('transactions').insert([{
        type: 'sell',
        amount: parseFloat(form.sell_price) || 0,
        description: `Sold ${selectedPhone.brand} ${selectedPhone.model} to ${form.buyer_name}`,
        phone_id: selectedPhone.id,
      }]);
      alert('✅ Phone sold successfully!');
      navigate('/');
    }
    setSaving(false);
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Sell Phone" />

      {!selectedPhone ? (
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Select a Ready Phone</h3>
          {loading ? <LoadingSpinner /> : phones.length === 0 ? <EmptyState message="No ready phones to sell" /> : (
            <div className="space-y-2">
              {phones.map(phone => (
                <button key={phone.id} onClick={() => setSelectedPhone(phone)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center text-left active:scale-[0.98] transition">
                  <div>
                    <p className="font-bold text-gray-800">{phone.brand} {phone.model}</p>
                    {phone.imei && <p className="text-[11px] text-gray-400 font-mono">IMEI: {phone.imei}</p>}
                    <p className="text-xs text-gray-500">{phone.colour} • {phone.storage_ram}</p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">₹{(phone.purchase_price || 0).toLocaleString('en-IN')}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSell} className="p-4 space-y-4">
          {/* Selected Phone Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-blue-800">{selectedPhone.brand} {selectedPhone.model}</p>
                <p className="text-xs text-blue-600">Cost: ₹{selectedPhone.purchase_price.toLocaleString('en-IN')}</p>
              </div>
              <button type="button" onClick={() => setSelectedPhone(null)} className="text-blue-400"><X className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Sell Details */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Sell Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sell Price (₹) *</label>
              <input type="number" value={form.sell_price} onChange={e => setForm({ ...form, sell_price: e.target.value })}
                placeholder="0" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          {/* Buyer Info - "Jisse liye h uska naam" */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Buyer Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Buyer Name (जिसने लिया) *</label>
              <input type="text" value={form.buyer_name} onChange={e => setForm({ ...form, buyer_name: e.target.value })}
                placeholder="Customer name" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone No.</label>
              <input type="tel" value={form.buyer_phone} onChange={e => setForm({ ...form, buyer_phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <textarea value={form.buyer_address} onChange={e => setForm({ ...form, buyer_address: e.target.value })}
                placeholder="Full address" rows={2}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Aadhar No.</label>
              <input type="text" value={form.buyer_aadhar} onChange={e => setForm({ ...form, buyer_aadhar: e.target.value })}
                placeholder="12-digit Aadhar number" maxLength={12}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">📸 Bill Photo</label>
              <label className="flex items-center justify-center space-x-2 w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition">
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Tap to take photo or upload</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleBillPhoto} className="hidden" />
              </label>
              {billPreview && (
                <img src={billPreview} alt="Bill preview" className="mt-2 rounded-xl w-full h-40 object-cover border border-gray-200" />
              )}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition disabled:opacity-50">
            <ShoppingCart className="w-5 h-5" />
            <span>{saving ? 'Processing...' : 'Confirm Sale'}</span>
          </button>
        </form>
      )}
    </div>
  );
};

// ===========================
// PAGE: PHONE DETAIL
// ===========================
const PhoneDetail = () => {
  const [phone, setPhone] = useState<PhoneRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.location.pathname.split('/phone/')[1];
    if (id) {
      supabase.from('phones').select('*').eq('id', id).single()
        .then(({ data }) => { setPhone(data); setLoading(false); });
    }
  }, []);

  const handleDelete = async () => {
    if (!phone || !confirm('Are you sure you want to delete this phone?')) return;
    await supabase.from('phones').delete().eq('id', phone.id);
    alert('Phone deleted');
    navigate('/phones');
  };

  if (loading) return <LoadingSpinner />;
  if (!phone) return <div className="p-4"><BackHeader title="Not Found" /><EmptyState message="Phone not found" /></div>;

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    ready: { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Ready to Sell' },
    repair_pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '🔧 Repair Pending' },
    sold: { bg: 'bg-gray-100', text: 'text-gray-600', label: '📦 Sold' },
  };
  const st = statusConfig[phone.status] || statusConfig.ready;

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Phone Details" />
      <div className="p-4 space-y-4">
        {/* Status + Brand Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${st.bg} ${st.text} mb-3`}>{st.label}</span>
          <h2 className="text-2xl font-bold text-gray-900">{phone.brand} {phone.model}</h2>
          {phone.colour && <p className="text-gray-500 mt-1">{phone.colour} • {phone.storage_ram}</p>}
        </div>

        {/* Information */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">📋 Information</h3>
          {[
            { label: 'Model Name', value: phone.model },
            { label: 'IMEI', value: phone.imei, mono: true },
            { label: 'Storage / RAM', value: phone.storage_ram },
            { label: 'Colour', value: phone.colour },
            { label: 'Purchase Price', value: phone.purchase_price ? `₹${phone.purchase_price.toLocaleString('en-IN')}` : '-' },
            { label: 'Sell Price', value: phone.sell_price ? `₹${phone.sell_price.toLocaleString('en-IN')}` : '-' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className={`text-sm font-semibold text-gray-800 ${item.mono ? 'font-mono' : ''}`}>{item.value || '-'}</span>
            </div>
          ))}
        </div>

        {/* Buyer Info (if sold) */}
        {phone.status === 'sold' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">👤 Buyer Details</h3>
            {[
              { label: 'Name', value: phone.buyer_name },
              { label: 'Phone No.', value: phone.buyer_phone },
              { label: 'Address', value: phone.buyer_address },
              { label: 'Aadhar No.', value: phone.buyer_aadhar },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{item.value || '-'}</span>
              </div>
            ))}
            {phone.bill_photo_url && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Bill Photo</p>
                <img src={phone.bill_photo_url} alt="Bill" className="rounded-xl w-full border border-gray-200" />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          {phone.status === 'ready' && (
            <button onClick={() => navigate('/sell')}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition">
              <ShoppingCart className="w-5 h-5" /><span>Sell</span>
            </button>
          )}
          <button onClick={handleDelete}
            className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 font-bold py-3 px-6 rounded-2xl active:scale-95 transition border border-red-200">
            <Trash2 className="w-5 h-5" /><span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================
// PAGE: DAILY HISAB
// ===========================
const DailyHisab = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const filtered = transactions.filter(t => (t.created_at || '').startsWith(dateFilter));

  const totals = {
    sell: filtered.filter(t => t.type === 'sell').reduce((s, t) => s + t.amount, 0),
    purchase: filtered.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0),
    invest: filtered.filter(t => t.type === 'invest').reduce((s, t) => s + t.amount, 0),
    loss: filtered.filter(t => t.type === 'loss').reduce((s, t) => s + t.amount, 0),
  };

  const typeConfig: Record<string, { color: string; icon: string }> = {
    sell: { color: 'text-green-600 bg-green-50', icon: '💰' },
    purchase: { color: 'text-blue-600 bg-blue-50', icon: '🛒' },
    invest: { color: 'text-purple-600 bg-purple-50', icon: '💼' },
    loss: { color: 'text-red-600 bg-red-50', icon: '📉' },
    expense: { color: 'text-orange-600 bg-orange-50', icon: '💸' },
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    await supabase.from('transactions').delete().eq('id', id);
    fetchTx();
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-3">📒 Daily Hisab</h1>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Day Summary */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-green-50 p-3 rounded-2xl border border-green-100 text-center">
          <p className="text-xs text-green-600 font-semibold">Sell</p>
          <p className="text-lg font-bold text-green-700">₹{totals.sell.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
          <p className="text-xs text-blue-600 font-semibold">Purchase</p>
          <p className="text-lg font-bold text-blue-700">₹{totals.purchase.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 text-center">
          <p className="text-xs text-purple-600 font-semibold">Invest</p>
          <p className="text-lg font-bold text-purple-700">₹{totals.invest.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl border border-red-100 text-center">
          <p className="text-xs text-red-600 font-semibold">Loss</p>
          <p className="text-lg font-bold text-red-700">₹{totals.loss.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Daily Note */}
      <div className="px-4 mb-4">
        <div className="bg-yellow-50/50 rounded-2xl border border-yellow-200 p-3 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">Note for {dateFilter}</span>
          </div>
          <DailyNote date={dateFilter} />
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-4 space-y-2">
        <p className="text-xs text-gray-500 font-medium">{filtered.length} transactions</p>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No transactions for this date" /> : (
          filtered.map(tx => {
            const cfg = typeConfig[tx.type] || typeConfig.expense;
            return (
              <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className={`text-xl p-2 rounded-xl ${cfg.color}`}>{cfg.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">{tx.type}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">{tx.description || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <p className={`font-bold ${cfg.color.split(' ')[0]}`}>₹{tx.amount.toLocaleString('en-IN')}</p>
                  <button onClick={() => handleDelete(tx.id!)} className="text-gray-300 active:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ===========================
// COMPONENT: DAILY NOTE
// ===========================
const DailyNote = ({ date }: { date: string }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [timeoutId, setTimeoutId] = useState<any>(null);

  useEffect(() => {
    supabase.from('daily_notes').select('note').eq('date', date).single()
      .then(({ data }) => setNote(data?.note || ''));
  }, [date]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNote(val);
    if (timeoutId) clearTimeout(timeoutId);
    setSaving(true);
    setTimeoutId(setTimeout(async () => {
      await supabase.from('daily_notes').upsert({ date, note: val });
      setSaving(false);
    }, 1000));
  };

  return (
    <div className="relative">
      <textarea value={note} onChange={handleChange}
        placeholder="Add any notes for today..." rows={2}
        className="w-full bg-transparent border-0 text-sm text-gray-700 focus:ring-0 p-0 resize-none placeholder-yellow-600/50 outline-none" />
      {saving && <span className="absolute bottom-0 right-0 text-[10px] text-yellow-600 font-semibold">Saving...</span>}
    </div>
  );
};

// ===========================
// PAGE: ADD TRANSACTION
// ===========================
const AddTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'sell', amount: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('transactions').insert([{
      type: form.type,
      amount: parseFloat(form.amount) || 0,
      description: form.description,
    }]);
    if (error) {
      alert('❌ Error: ' + error.message);
    } else {
      alert('✅ Transaction added!');
      navigate('/hisab');
    }
    setLoading(false);
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Add Transaction" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'sell', label: '💰 Sell', color: 'border-green-400 bg-green-50 text-green-700' },
                { value: 'purchase', label: '🛒 Purchase', color: 'border-blue-400 bg-blue-50 text-blue-700' },
                { value: 'invest', label: '💼 Invest', color: 'border-purple-400 bg-purple-50 text-purple-700' },
                { value: 'loss', label: '📉 Loss', color: 'border-red-400 bg-red-50 text-red-700' },
              ].map(t => (
                <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition ${
                    form.type === t.value ? t.color : 'border-gray-200 text-gray-500'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₹) *</label>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Details..." rows={2}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition disabled:opacity-50">
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Transaction'}</span>
        </button>
      </form>
    </div>
  );
};

// ===========================
// PAGE: CLIENTS
// ===========================
const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('clients').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setClients(data || []); setLoading(false); });
  }, []);

  const filtered = clients.filter(c =>
    !searchTerm ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone_number || '').includes(searchTerm)
  );

  const totalDue = clients.reduce((s, c) => s + (c.due_payment || 0), 0);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-gray-800">👥 Clients</h1>
          <button onClick={() => navigate('/add/client')}
            className="bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-xl active:scale-95 transition">
            + Add
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
      </div>

      {/* Total Due Banner */}
      {totalDue > 0 && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl p-3 flex justify-between items-center">
          <span className="text-sm text-red-700 font-medium">Total Due Payment</span>
          <span className="text-lg font-bold text-red-700">₹{totalDue.toLocaleString('en-IN')}</span>
        </div>
      )}

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No clients yet" /> : (
        <div className="p-4 space-y-2">
          {filtered.map(client => (
            <div key={client.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{client.name}</p>
                  {client.phone_number && <p className="text-xs text-gray-500 mt-0.5">📞 {client.phone_number}</p>}
                  {client.address && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">📍 {client.address}</p>}
                </div>
                <div className="text-right flex items-center space-x-2">
                  {(client.due_payment || 0) > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                      ₹{client.due_payment.toLocaleString('en-IN')} Due
                    </span>
                  )}
                  <button onClick={() => handleDelete(client.id!)} className="text-gray-300 active:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===========================
// PAGE: ADD CLIENT
// ===========================
const AddClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone_number: '', address: '', aadhar_no: '', due_payment: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('clients').insert([{
      name: form.name,
      phone_number: form.phone_number,
      address: form.address,
      aadhar_no: form.aadhar_no,
      due_payment: parseFloat(form.due_payment) || 0,
    }]);
    if (error) {
      alert('❌ Error: ' + error.message);
    } else {
      alert('✅ Client added!');
      navigate('/clients');
    }
    setLoading(false);
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Add Client" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Client name" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <input type="tel" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })}
              placeholder="10-digit mobile number"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
            <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Full address" rows={2}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Aadhar No.</label>
            <input type="text" value={form.aadhar_no} onChange={e => setForm({ ...form, aadhar_no: e.target.value })}
              placeholder="12-digit Aadhar number" maxLength={12}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Due Payment (₹)</label>
            <input type="number" value={form.due_payment} onChange={e => setForm({ ...form, due_payment: e.target.value })}
              placeholder="0"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition disabled:opacity-50">
          <UserPlus className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Client'}</span>
        </button>
      </form>
    </div>
  );
};

// ===========================
// PAGE: PHONE INFO (IMEI SEARCH)
// ===========================
const PhoneInfoSearch = () => {
  const [imei, setImei] = useState('');
  const [phone, setPhone] = useState<PhoneRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase.from('phones').select('*').eq('imei', imei.trim()).single();
    setPhone(data);
    setLoading(false);
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Phone Information" />
      <div className="p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input type="text" value={imei} onChange={e => setImei(e.target.value)}
            placeholder="Enter IMEI number..." maxLength={15}
            className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono" />
          <button type="submit" disabled={loading}
            className="bg-cyan-600 text-white px-5 rounded-xl active:scale-95 transition disabled:opacity-50">
            <Search className="w-5 h-5" />
          </button>
        </form>

        {loading && <LoadingSpinner />}

        {searched && !loading && !phone && (
          <EmptyState message="No phone found with this IMEI" />
        )}

        {phone && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
              <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">📋 Phone Information</h3>
              {[
                { label: 'Brand', value: phone.brand },
                { label: 'Model Name', value: phone.model },
                { label: 'IMEI', value: phone.imei },
                { label: 'Storage / RAM', value: phone.storage_ram },
                { label: 'Colour', value: phone.colour },
                { label: 'Status', value: phone.status === 'ready' ? '✅ Ready' : phone.status === 'sold' ? '📦 Sold' : '🔧 Repair' },
                { label: 'Purchase Price', value: `₹${(phone.purchase_price || 0).toLocaleString('en-IN')}` },
                { label: 'Sell Price', value: phone.sell_price ? `₹${phone.sell_price.toLocaleString('en-IN')}` : '-' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.value || '-'}</span>
                </div>
              ))}
            </div>

            {phone.buyer_name && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">👤 Buyer (जिसने लिया)</h3>
                {[
                  { label: 'Name', value: phone.buyer_name },
                  { label: 'Phone No.', value: phone.buyer_phone },
                  { label: 'Address', value: phone.buyer_address },
                  { label: 'Aadhar No.', value: phone.buyer_aadhar },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{item.value || '-'}</span>
                  </div>
                ))}
                {phone.bill_photo_url && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Bill Photo</p>
                    <img src={phone.bill_photo_url} alt="Bill" className="rounded-xl w-full border border-gray-200" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ===========================
// PAGE: REPAIRS
// ===========================
const RepairsList = () => {
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('phones').select('*').eq('status', 'repair_pending').order('created_at', { ascending: false })
      .then(({ data }) => { setPhones(data || []); setLoading(false); });
  }, []);

  const markReady = async (id: string) => {
    await supabase.from('phones').update({ status: 'ready' }).eq('id', id);
    setPhones(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-800">🔧 Repair Pending</h1>
        <p className="text-xs text-gray-500 mt-0.5">{phones.length} phones in repair</p>
      </div>

      {loading ? <LoadingSpinner /> : phones.length === 0 ? <EmptyState message="No phones in repair 🎉" /> : (
        <div className="p-4 space-y-2">
          {phones.map(phone => (
            <div key={phone.id} className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-100 flex justify-between items-center">
              <div onClick={() => navigate(`/phone/${phone.id}`)} className="cursor-pointer flex-1">
                <p className="font-bold text-gray-800">{phone.brand} {phone.model}</p>
                {phone.imei && <p className="text-[11px] text-gray-400 font-mono">IMEI: {phone.imei}</p>}
                <p className="text-xs text-gray-500">{phone.colour} • {phone.storage_ram}</p>
              </div>
              <button onClick={() => markReady(phone.id!)}
                className="bg-green-100 text-green-700 text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition whitespace-nowrap">
                ✅ Mark Ready
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===========================
// PAGE: GIRWI LIST (गिरवी)
// ===========================
const GirwiList = () => {
  const [girwiItems, setGirwiItems] = useState<GirwiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'redeemed' | 'all'>('active');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('girwi').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setGirwiItems(data || []); setLoading(false); });
  }, []);

  const filtered = girwiItems.filter(g => filter === 'all' || g.status === filter);

  const calcInterest = (g: GirwiRecord) => {
    const startDate = new Date(g.start_date);
    const now = new Date();
    const elapsedDays = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyRate = (g.interest_rate || 0) / 100 / 30; // monthly rate to daily
    const interest = g.price * dailyRate * elapsedDays;
    return { elapsedDays, interest: Math.round(interest), total: Math.round(g.price + interest) };
  };

  const handleRedeem = async (id: string) => {
    if (!confirm('Mark this girwi as redeemed (returned)?')) return;
    await supabase.from('girwi').update({ status: 'redeemed' }).eq('id', id);
    setGirwiItems(prev => prev.map(g => g.id === id ? { ...g, status: 'redeemed' } : g));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this girwi record?')) return;
    await supabase.from('girwi').delete().eq('id', id);
    setGirwiItems(prev => prev.filter(g => g.id !== id));
  };

  const totalActive = girwiItems.filter(g => g.status === 'active');
  const totalAmount = totalActive.reduce((s, g) => s + (g.price || 0), 0);
  const totalInterestDue = totalActive.reduce((s, g) => s + calcInterest(g).interest, 0);

  return (
    <div className="pb-24 min-h-screen page-enter">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-gray-800">🔒 Girwi (गिरवी)</h1>
          <button onClick={() => navigate('/add/girwi')}
            className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-xl active:scale-95 transition">
            + Add
          </button>
        </div>
        <div className="flex space-x-2">
          {(['active', 'redeemed', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                filter === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-amber-600 font-semibold">Active</p>
            <p className="text-lg font-bold text-amber-800">{totalActive.length}</p>
          </div>
          <div>
            <p className="text-xs text-amber-600 font-semibold">Amount</p>
            <p className="text-lg font-bold text-amber-800">₹{totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs text-red-500 font-semibold">Interest Due</p>
            <p className="text-lg font-bold text-red-600">₹{totalInterestDue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState message="No girwi records" /> : (
        <div className="p-4 space-y-3">
          {filtered.map(g => {
            const { elapsedDays, total } = calcInterest(g);
            const isActive = g.status === 'active';
            return (
              <div key={g.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${
                isActive ? 'border-amber-200' : 'border-green-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-bold text-gray-800">{g.phone_brand} {g.phone_model}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isActive ? '🔒 Active' : '✅ Redeemed'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">👤 {g.customer_name} • {g.customer_phone}</p>
                    {g.imei && <p className="text-[11px] text-gray-400 font-mono">IMEI: {g.imei}</p>}
                  </div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-gray-500 font-medium">Price (दिया)</p>
                    <p className="text-sm font-bold text-gray-800">₹{(g.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-gray-500 font-medium">Interest Rate</p>
                    <p className="text-sm font-bold text-gray-800">{g.interest_rate}% / month</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-amber-600 font-medium">Days Elapsed</p>
                    <p className="text-sm font-bold text-amber-700">{elapsedDays} days</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2 text-center">
                    <p className="text-[10px] text-red-500 font-medium">Total Due</p>
                    <p className="text-sm font-bold text-red-600">₹{total.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mb-3">
                  Started: {new Date(g.start_date).toLocaleDateString('en-IN')} • Duration: {g.days} days
                  {isActive && elapsedDays > g.days && (
                    <span className="text-red-500 font-semibold"> • ⚠️ OVERDUE by {elapsedDays - g.days} days</span>
                  )}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {isActive && (
                    <button onClick={() => handleRedeem(g.id!)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-green-100 text-green-700 text-xs font-bold py-2.5 rounded-xl active:scale-95 transition">
                      <Unlock className="w-4 h-4" /><span>Redeem</span>
                    </button>
                  )}
                  <button onClick={() => handleDelete(g.id!)}
                    className="flex items-center justify-center space-x-1 bg-red-50 text-red-500 text-xs font-bold py-2.5 px-4 rounded-xl active:scale-95 transition">
                    <Trash2 className="w-4 h-4" /><span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===========================
// PAGE: ADD GIRWI
// ===========================
const AddGirwi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', phone_brand: '',
    phone_model: '', imei: '', price: '', interest_rate: '',
    days: '', start_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('girwi').insert([{
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      phone_brand: form.phone_brand,
      phone_model: form.phone_model,
      imei: form.imei,
      price: parseFloat(form.price) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      days: parseInt(form.days) || 30,
      start_date: form.start_date,
      status: 'active',
    }]);

    if (error) {
      alert('❌ Error: ' + error.message);
    } else {
      // Also record as investment transaction
      await supabase.from('transactions').insert([{
        type: 'invest',
        amount: parseFloat(form.price) || 0,
        description: `Girwi: ${form.phone_brand} ${form.phone_model} - ${form.customer_name}`,
      }]);
      alert('✅ Girwi added successfully!');
      navigate('/girwi');
    }
    setLoading(false);
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Add Girwi (गिरवी)" />
      <form onSubmit={handleSubmit} className="p-4 space-y-4">

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">👤 Customer Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name *</label>
            <input type="text" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
              placeholder="Customer name" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Phone</label>
            <input type="tel" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })}
              placeholder="10-digit mobile number"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        {/* Phone Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">📱 Phone Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Brand *</label>
              <input type="text" value={form.phone_brand} onChange={e => setForm({ ...form, phone_brand: e.target.value })}
                placeholder="e.g. Samsung" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Model *</label>
              <input type="text" value={form.phone_model} onChange={e => setForm({ ...form, phone_model: e.target.value })}
                placeholder="e.g. Galaxy A54" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">IMEI Number</label>
            <input type="text" value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })}
              placeholder="15-digit IMEI" maxLength={15}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
          </div>
        </div>

        {/* Girwi Terms */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 space-y-4">
          <h3 className="font-bold text-amber-700 text-sm uppercase tracking-wide">💰 Girwi Terms</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Price / Amount Given (₹) *</label>
            <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0" required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Interest (% / month) *</label>
              <input type="number" step="0.1" value={form.interest_rate} onChange={e => setForm({ ...form, interest_rate: e.target.value })}
                placeholder="e.g. 5" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Days *</label>
              <input type="number" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })}
                placeholder="e.g. 30" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition disabled:opacity-50">
          <Lock className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Girwi'}</span>
        </button>
      </form>
    </div>
  );
};

// ===========================
// PAGE: GENERATE BILL
// ===========================
const GenerateBill = () => {
  const [form, setForm] = useState({
    date: new Date().toLocaleDateString('en-IN'),
    customerName: '',
    customerPhone: '',
    mobileName: '',
    imei: '',
    price: '',
    address: '',
  });

  const handleShare = () => {
    const text = `📱 *Goswami Mobile - Bill/Invoice* 📱
    
*Date:* ${form.date}
*Customer Name:* ${form.customerName}
*Phone No:* ${form.customerPhone}
*Address:* ${form.address}

*Mobile Detail:* ${form.mobileName}
*IMEI No:* ${form.imei}
*Amount:* ₹${form.price}

Thank you for your business! 🙏`;
    
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="pb-24 min-h-screen page-enter">
      <BackHeader title="Generate Bill" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">📝 Bill Details</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
              <input type="text" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₹)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
            <input type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}
              placeholder="e.g. Rahul Kumar"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Customer Phone</label>
            <input type="tel" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })}
              placeholder="10-digit number"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="City, Area"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Name / Brand</label>
            <input type="text" value={form.mobileName} onChange={e => setForm({ ...form, mobileName: e.target.value })}
              placeholder="e.g. Samsung Galaxy S23"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">IMEI Number</label>
            <input type="text" value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })}
              placeholder="15-digit IMEI"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono" />
          </div>
        </div>

        <button onClick={handleShare}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-500 to-green-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition">
          <Send className="w-5 h-5" />
          <span>Share Bill on WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

// ===========================
// MAIN APP
// ===========================
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">

        {/* Main Content */}
        <div className="h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/phones" element={<PhonesList />} />
            <Route path="/add" element={<AddMenu />} />
            <Route path="/add/phone" element={<AddPhone />} />
            <Route path="/add/client" element={<AddClient />} />
            <Route path="/add/transaction" element={<AddTransaction />} />
            <Route path="/sell" element={<SellPhone />} />
            <Route path="/hisab" element={<DailyHisab />} />
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/info" element={<PhoneInfoSearch />} />
            <Route path="/phone/:id" element={<PhoneDetail />} />
            <Route path="/repairs" element={<RepairsList />} />
            <Route path="/girwi" element={<GirwiList />} />
            <Route path="/add/girwi" element={<AddGirwi />} />
            <Route path="/bill" element={<GenerateBill />} />
          </Routes>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 pt-2 pb-safe z-50">
          <div className="flex justify-between items-center">
            <NavItem to="/" icon={Home} label="Home" />
            <NavItem to="/phones" icon={Smartphone} label="Stock" />

            {/* Center FAB */}
            <Link to="/add" className="relative -mt-7">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-xl active:scale-90 transition ring-4 ring-white">
                <PlusCircle className="w-6 h-6" />
              </div>
            </Link>

            <NavItem to="/hisab" icon={IndianRupee} label="Hisab" />
            <NavItem to="/clients" icon={Users} label="Clients" />
          </div>
        </nav>
      </div>
    </Router>
  );
}

// ===========================
// BOTTOM NAV ITEM
// ===========================
const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
  const isActive = window.location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center py-1 px-3 transition ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
      <Icon className="w-5 h-5" />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </Link>
  );
};
