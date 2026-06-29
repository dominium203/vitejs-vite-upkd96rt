import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Send,
  Copy,
  CheckCircle2,
  ArrowRightLeft,
  X,
  CheckSquare,
  Gift,
  Save,
  RefreshCcw,
  Store,
  UserCircle,
  Inbox,
  Link as LinkIcon,
  Trash2,
  Check,
  Plus,
  } from 'lucide-react';
  import { initializeApp } from 'firebase/app';
  import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';

// --- CONFIGURAÇÃO DO FIREBASE ---
// ATENÇÃO: Substitua os valores abaixo com as chaves reais do seu projeto no Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBPQSVIG3GegAXm1eEHdp1KE8W8JBs7eqk',
  authDomain: 'central-de-trocas-3259d.firebaseapp.com',
  projectId: 'central-de-trocas-3259d',
  storageBucket: 'central-de-trocas-3259d.firebasestorage.app',
  messagingSenderId: '272929458456',
  appId: '1:272929458456:web:bb7513f9b4aa939201f66d',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'app-central-trocas-copa';

// --- DADOS INICIAIS ---
const initialMissingData = [
  { id: 'fwc', name: 'FWC 🏆', stickers: [3, 4, 5, 6, 8, 11, 14, 17, 19] },
  { id: 'coca', name: 'Coca-Cola 🥤', stickers: [6, 10, 13, 14] },
  { id: 'mex', name: 'México 🇲🇽', stickers: [1, 2, 3, 10, 11, 18, 19] },
  { id: 'rsa', name: 'África do Sul 🇿🇦', stickers: [1, 7, 16, 17, 18] },
  { id: 'kor', name: 'Coreia do Sul 🇰🇷', stickers: [2, 4, 6, 8, 13, 20] },
  { id: 'cze', name: 'Tchéquia 🇨🇿', stickers: [1, 2, 7, 8, 11, 12, 13, 14, 16, 20] },
  { id: 'can', name: 'Canadá 🇨🇦', stickers: [2, 6, 7, 13, 14, 17] },
  { id: 'sui', name: 'Suíça 🇨🇭', stickers: [4, 5, 6, 8, 13, 19] },
  { id: 'qat', name: 'Catar 🇶🇦', stickers: [13, 14, 17, 18] },
  { id: 'bih', name: 'Bósnia e Herzegovina 🇧🇦', stickers: [1, 2, 4, 5, 7, 8, 12, 13, 15, 17, 18] },
  { id: 'bra', name: 'Brasil 🇧🇷', stickers: [4, 10, 11, 12, 16, 17, 19, 20] },
  { id: 'mar', name: 'Marrocos 🇲🇦', stickers: [1, 3, 4, 5, 8, 12, 17, 18] },
  { id: 'hai', name: 'Haiti 🇭🇹', stickers: [4, 9, 12, 14, 17, 18] },
  { id: 'sco', name: 'Escócia 🏴󠁧󠁢󠁳󠁣󠁴󠁿', stickers: [12, 16, 18, 19, 20] },
  { id: 'usa', name: 'Estados Unidos 🇺🇸', stickers: [1, 2, 3, 4, 6, 8, 10, 11, 13, 15, 16, 19, 20] },
  { id: 'par', name: 'Paraguai 🇵🇾', stickers: [2, 6, 7, 12, 13, 14, 17, 18] },
  { id: 'aus', name: 'Austrália 🇦🇺', stickers: [2, 3, 5, 6, 7, 10, 11, 13, 15, 18, 19] },
  { id: 'tur', name: 'Turquia 🇹🇷', stickers: [2, 3, 4, 5, 8, 9, 11, 13, 15, 18, 19, 20] },
  { id: 'ger', name: 'Alemanha 🇩🇪', stickers: [4, 5, 9, 13, 17, 18] },
  { id: 'ecu', name: 'Equador 🇪🇨', stickers: [1, 7, 8, 9, 10, 11, 14, 15, 20] },
  { id: 'civ', name: 'Costa do Marfim 🇨🇮', stickers: [1, 2, 4, 5, 6, 11, 14, 16, 17, 20] },
  { id: 'cuw', name: 'Curaçao 🇨🇼', stickers: [4, 8, 12, 13, 17] },
  { id: 'ned', name: 'Holanda 🇳🇱', stickers: [1, 4, 5, 9, 10, 11, 14, 15, 17, 18] },
  { id: 'jpn', name: 'Japão 🇯🇵', stickers: [1, 2, 3, 13, 15, 16, 19, 20] },
  { id: 'swe', name: 'Suécia 🇸🇪', stickers: [3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 18, 20] },
  { id: 'tun', name: 'Tunísia 🇹🇳', stickers: [4, 8, 9, 10, 13, 19, 20] },
  { id: 'bel', name: 'Bélgica 🇧🇪', stickers: [1, 5, 7, 10] },
  { id: 'egy', name: 'Egito 🇪🇬', stickers: [1, 3, 4, 5, 7, 8, 9, 10, 12, 15, 17] },
  { id: 'irn', name: 'Irã 🇮🇷', stickers: [4, 5, 6, 7, 8, 9, 10, 12, 15, 17, 19, 20] },
  { id: 'nzl', name: 'Nova Zelândia 🇳🇿', stickers: [1, 4, 5, 9, 12, 17, 18] },
  { id: 'esp', name: 'Espanha 🇪🇸', stickers: [4, 6, 10, 12, 13, 15, 18] },
  { id: 'uru', name: 'Uruguai 🇺🇾', stickers: [3, 5, 7, 8, 9, 11, 17] },
  { id: 'ksa', name: 'Arábia Saudita 🇸🇦', stickers: [1, 2, 9, 10, 11, 13, 15, 16, 18, 20] },
  { id: 'cpv', name: 'Cabo Verde 🇨🇻', stickers: [1, 9, 13, 14, 16] },
  { id: 'fra', name: 'França 🇫🇷', stickers: [3, 6, 13, 14, 19] },
  { id: 'nor', name: 'Noruega 🇳🇴', stickers: [1, 3, 5, 8, 11, 12, 13, 14, 16, 17, 19] },
  { id: 'sen', name: 'Senegal 🇸🇳', stickers: [1, 7, 19] },
  { id: 'irq', name: 'Iraque 🇮🇶', stickers: [3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18] },
  { id: 'arg', name: 'Argentina 🇦🇷', stickers: [1, 2, 3, 7, 8, 15, 17, 18, 20] },
  { id: 'aut', name: 'Áustria 🇦🇹', stickers: [4, 6, 7, 8, 9, 14] },
  { id: 'alg', name: 'Argélia 🇩🇿', stickers: [1, 3, 4, 6, 9, 15] },
  { id: 'jor', name: 'Jordânia 🇯🇴', stickers: [5, 13, 17, 19, 20] },
  { id: 'por', name: 'Portugal 🇵🇹', stickers: [6, 7, 11, 14, 15, 16, 19, 20] },
  { id: 'col', name: 'Colômbia 🇨🇴', stickers: [1, 2, 3, 5, 6, 8, 9, 11, 14, 15, 16, 18] },
  { id: 'cod', name: 'RD Congo 🇨🇩', stickers: [1, 2, 3, 5, 8, 11, 15, 16, 17, 18] },
  { id: 'uzb', name: 'Uzbequistão 🇺🇿', stickers: [1, 6, 7, 8, 9, 14, 15, 16, 20] },
  { id: 'eng', name: 'Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿', stickers: [1, 3, 12, 14, 17, 19, 20] },
  { id: 'cro', name: 'Croácia 🇭🇷', stickers: [9, 10, 11, 18] },
  { id: 'gha', name: 'Gana 🇬🇭', stickers: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 16, 17, 20] },
  { id: 'pan', name: 'Panamá 🇵🇦', stickers: [2, 3, 5, 8, 9, 10, 11, 13, 15, 16, 18, 19] },
];
const initialDuplicateData = [
  { id: 'cro', name: 'Croácia 🇭🇷', stickers: [3, 6, 7, 8, 15, 19] },
  { id: 'cod', name: 'RD Congo 🇨🇩', stickers: [7, 8, 9, 20, 20] },
  { id: 'col', name: 'Colômbia 🇨🇴', stickers: [4, 4, 12] },
  { id: 'por', name: 'Portugal 🇵🇹', stickers: [12] },
  { id: 'jor', name: 'Jordânia 🇯🇴', stickers: [6, 7, 9, 10, 11, 15, 18] },
  { id: 'tun', name: 'Tunísia 🇹🇳', stickers: [1, 3, 10, 11] },
  { id: 'pan', name: 'Panamá 🇵🇦', stickers: [4, 7] },
  { id: 'eng', name: 'Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿', stickers: [6, 6] },
  { id: 'uzb', name: 'Uzbequistão 🇺🇿', stickers: [17, 18] },
  { id: 'arg', name: 'Argentina 🇦🇷', stickers: [6, 10, 16] },
  { id: 'aut', name: 'Áustria 🇦🇹', stickers: [3, 10, 11, 12, 13, 20] },
  { id: 'uru', name: 'Uruguai 🇺🇾', stickers: [20, 20] },
  { id: 'fra', name: 'França 🇫🇷', stickers: [4] },
  { id: 'cpv', name: 'Cabo Verde 🇨🇻', stickers: [3, 7, 20] },
  { id: 'alg', name: 'Argélia 🇩🇿', stickers: [16] },
  { id: 'sen', name: 'Senegal 🇸🇳', stickers: [3, 5, 6, 6, 7, 16, 20] },
  { id: 'nzl', name: 'Nova Zelândia 🇳🇿', stickers: [7, 11] },
  { id: 'esp', name: 'Espanha 🇪🇸', stickers: [20] },
  { id: 'bel', name: 'Bélgica 🇧🇪', stickers: [11] },
  { id: 'egy', name: 'Egito 🇪🇬', stickers: [2, 16] },
  { id: 'irn', name: 'Irã 🇮🇷', stickers: [3] },
  { id: 'jpn', name: 'Japão 🇯🇵', stickers: [12] },
  { id: 'swe', name: 'Suécia 🇸🇪', stickers: [10, 16] },
  { id: 'cuw', name: 'Curaçao 🇨🇼', stickers: [2, 14] },
  { id: 'civ', name: 'Costa do Marfim 🇨🇮', stickers: [8, 8] },
  { id: 'ecu', name: 'Equador 🇪🇨', stickers: [17] },
  { id: 'ned', name: 'Holanda 🇳🇱', stickers: [3, 7, 8] },
  { id: 'sco', name: 'Escócia 🏴󠁧󠁢󠁳󠁣󠁴󠁿', stickers: [3, 4, 5] },
  { id: 'ger', name: 'Alemanha 🇩🇪', stickers: [1, 16] },
  { id: 'hai', name: 'Haiti 🇭🇹', stickers: [5, 7, 11] },
  { id: 'qat', name: 'Catar 🇶🇦', stickers: [2, 2, 19] },
  { id: 'sui', name: 'Suíça 🇨🇭', stickers: [2, 14, 20] },
  { id: 'mar', name: 'Marrocos 🇲🇦', stickers: [11, 14] },
  { id: 'can', name: 'Canadá 🇨🇦', stickers: [1, 16, 19, 19] },
  { id: 'bih', name: 'Bósnia e Herzegovina 🇧🇦', stickers: [6, 19] },
  { id: 'irq', name: 'Iraque 🇮🇶', stickers: [1, 2] },
  { id: 'rsa', name: 'África do Sul 🇿🇦', stickers: [4, 5, 10, 11, 14, 14, 15] },
  { id: 'kor', name: 'Coreia do Sul 🇰🇷', stickers: [1, 10] },
  { id: 'bra', name: 'Brasil 🇧🇷', stickers: [1] },
  { id: 'fwc', name: 'FWC 🏆', stickers: [13, 18, 18] },
];
export default function App() {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('owner');
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('offer');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Carrinho do Cliente
  const [selectedWants, setSelectedWants] = useState({});
  const [selectedHaves, setSelectedHaves] = useState({});
  const [customerName, setCustomerName] = useState('');

  // Controle de Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientOrderStep, setClientOrderStep] = useState(1);
  const [removeModalData, setRemoveModalData] = useState(null);
  const [ownerCopied, setOwnerCopied] = useState(false);
  const [showSuccessOwner, setShowSuccessOwner] = useState(false);

  // Controles de Estado do Formulário
  const [newStickerCountry, setNewStickerCountry] = useState('');
  const [newStickerNumber, setNewStickerNumber] = useState('');
  const googleProvider = new GoogleAuthProvider();

// Inicializa a Autenticação e Banco de Dados
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const storeIdDaUrl = urlParams.get('loja');
  if (storeIdDaUrl) {
    setViewMode('client');
    setActiveStoreId(storeIdDaUrl);
    signInAnonymously(auth).catch(console.error);
  } else {
    setViewMode('owner');
  }
  const unsubscribe = onAuthStateChanged(auth, (usr) => {
    setUser(usr);
    if (usr && !usr.isAnonymous && !storeIdDaUrl) {
      setActiveStoreId(usr.uid);
    }
  });
  return () => unsubscribe();
}, []);

const loginWithGoogle = async () => {
  try {
    if (user && user.isAnonymous) {
      await signOut(auth);
    }
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Erro no login:', error);
    alert('Erro ao fazer login. Tente novamente.');
  }
};

const handleAddSticker = async () => {
  if (!newStickerCountry || !newStickerNumber || !inventory) return;
  const newInventory = { ...inventory };
  const listType = activeTab === 'offer' ? 'duplicateData' : 'missingData';
  let sectionIndex = newInventory[listType].findIndex(s => s.id === newStickerCountry);
  
  // Se o país ainda não existir na lista atual, busca da lista mestre
  if (sectionIndex === -1) {
    const countryInfo = initialMissingData.find(c => c.id === newStickerCountry);
    if (countryInfo) {
      newInventory[listType].push({ id: countryInfo.id, name: countryInfo.name, stickers: [] });
      sectionIndex = newInventory[listType].length - 1;
    } else {
      return;
    }
  }
  
  const num = parseInt(newStickerNumber, 10);
  newInventory[listType][sectionIndex].stickers.push(num);
  newInventory[listType][sectionIndex].stickers.sort((a, b) => a - b);
  
  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'inventories', user.uid), newInventory);
  setNewStickerNumber('');
  alert('Figurinha adicionada com sucesso!');
};


  useEffect(() => {
    if (!activeStoreId) return;

    const unsub = onSnapshot(
      doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'inventories',
        activeStoreId
      ),
      (docSnap) => {
        if (docSnap.exists()) {
          setInventory(docSnap.data());
        } else if (viewMode === 'owner' && user && activeStoreId === user.uid) {
          const initData = {
            missingData: initialMissingData,
            duplicateData: initialDuplicateData,
          };
          setDoc(
            doc(
              db,
              'artifacts',
              appId,
              'public',
              'data',
              'inventories',
              activeStoreId
            ),
            initData
          );
          setInventory(initData);
        } else {
          setInventory(null);
        }
      },
      (err) => console.error(err)
    );

    return () => unsub();
  }, [activeStoreId, viewMode, user]);

  useEffect(() => {
    if (!activeStoreId) return;

    const unsub = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'orders'),
      (snapshot) => {
        const fetchedOrders = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.storeId === activeStoreId) {
            fetchedOrders.push({ id: d.id, ...data });
          }
        });
        fetchedOrders.sort((a, b) => b.timestamp - a.timestamp);
        setOrders(fetchedOrders);
      },
      (err) => console.error(err)
    );

    return () => unsub();
  }, [activeStoreId]);

  const totalWants = Object.keys(selectedWants).length;
  const totalHaves = Object.keys(selectedHaves).length;

  const toggleWant = (sectionId, stickerNumber, index, sectionName) => {
    const key = `${sectionId}-${stickerNumber}-${index}`;
    setSelectedWants((prev) => {
      const newState = { ...prev };
      if (newState[key]) delete newState[key];
      else newState[key] = { sectionName, stickerNumber };
      return newState;
    });
  };

  const toggleHave = (sectionId, stickerNumber, sectionName) => {
    const key = `${sectionId}-${stickerNumber}`;
    setSelectedHaves((prev) => {
      const newState = { ...prev };
      if (newState[key]) delete newState[key];
      else newState[key] = { sectionName, stickerNumber };
      return newState;
    });
  };

  const reservedWantsKeys = useMemo(() => {
    const keys = new Set();
    orders.forEach(order => Object.keys(order.wants || {}).forEach(k => keys.add(k)));
    return keys;
  }, [orders]);

  const reservedHavesKeys = useMemo(() => {
    const keys = new Set();
    orders.forEach(order => Object.keys(order.haves || {}).forEach(k => keys.add(k)));
    return keys;
  }, [orders]);

  const filteredOfferData = useMemo(() => {
    if (!inventory) return [];
    return inventory.duplicateData
      .map(section => ({
        ...section,
        stickers: section.stickers.filter((sticker, index) => !reservedWantsKeys.has(`${section.id}-${sticker}-${index}`))
      }))
      .filter((s) => s.stickers.length > 0)
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const indexA = initialMissingData.findIndex(c => c.id === a.id);
        const indexB = initialMissingData.findIndex(c => c.id === b.id);
        return indexA - indexB;
      });
  }, [inventory, searchTerm, reservedWantsKeys]);

  const filteredNeedData = useMemo(() => {
    if (!inventory) return [];
    return inventory.missingData
      .map(section => ({
        ...section,
        stickers: section.stickers.filter(sticker => !reservedHavesKeys.has(`${section.id}-${sticker}`))
      }))
      .filter((s) => s.stickers.length > 0)
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const indexA = initialMissingData.findIndex(c => c.id === a.id);
        const indexB = initialMissingData.findIndex(c => c.id === b.id);
        return indexA - indexB;
      });
  }, [inventory, searchTerm, reservedHavesKeys]);

  // --- FUNÇÕES DE TEXTO E MENSAGENS ---
  const generateTradeMessage = (name) => {
    let message = `Fala! Sou o ${
      name || 'seu amigo'
    } e fiz um pedido pelo seu aplicativo para trocarmos figurinhas! ⚽\n\n`;

    if (totalWants > 0) {
      message += '✨ *EU QUERO as que você oferece:*\n';
      const wantsGrouped = {};
      Object.values(selectedWants).forEach((item) => {
        if (!wantsGrouped[item.sectionName])
          wantsGrouped[item.sectionName] = [];
        wantsGrouped[item.sectionName].push(item.stickerNumber);
      });
      Object.keys(wantsGrouped)
        .sort()
        .forEach((country) => {
          message += `- ${country}: ${wantsGrouped[country]
            .sort((a, b) => a - b)
            .join(', ')}\n`;
        });
      message += '\n';
    }

    if (totalHaves > 0) {
      message += '🤝 *EU TENHO as que você precisa:*\n';
      const havesGrouped = {};
      Object.values(selectedHaves).forEach((item) => {
        if (!havesGrouped[item.sectionName])
          havesGrouped[item.sectionName] = [];
        havesGrouped[item.sectionName].push(item.stickerNumber);
      });
      Object.keys(havesGrouped)
        .sort()
        .forEach((country) => {
          message += `- ${country}: ${havesGrouped[country]
            .sort((a, b) => a - b)
            .join(', ')}\n`;
        });
      message += '\n';
    }

    message += 'Já enviei e está aguardando você aprovar lá no sistema!';
    return message;
  };

  // --- FUNÇÕES DO CLIENTE ---
  const saveOrderToDatabase = async () => {
    const finalName = customerName.trim() || 'Amigo Anônimo';

    await addDoc(
      collection(db, 'artifacts', appId, 'public', 'data', 'orders'),
      {
        storeId: activeStoreId,
        customerName: finalName,
        wants: selectedWants,
        haves: selectedHaves,
        timestamp: Date.now(),
      }
    );

    setClientOrderStep(2);
  };

  const closeClientModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setClientOrderStep(1);
      setSelectedWants({});
      setSelectedHaves({});
      setCustomerName('');
    }, 300);
  };

  // --- FUNÇÕES DO DONO DA LOJA ---
  const approveOrder = async (order) => {
    if (!inventory) return;

    const newDuplicates = inventory.duplicateData.map((section) => {
      const remaining = section.stickers.filter((sticker, index) => {
        const key = `${section.id}-${sticker}-${index}`;
        return !order.wants[key];
      });
      return { ...section, stickers: remaining };
    });

    const newMissing = inventory.missingData.map((section) => {
      const remaining = section.stickers.filter((sticker) => {
        const key = `${section.id}-${sticker}`;
        return !order.haves[key];
      });
      return { ...section, stickers: remaining };
    });

    await setDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'inventories', user.uid),
      {
        missingData: newMissing,
        duplicateData: newDuplicates,
      }
    );

    await deleteDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'orders', order.id)
    );
  };

  const rejectOrder = async (orderId) => {
    await deleteDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId)
    );
  };

  const removeItemFromOrder = async (orderId, type, itemKey) => {
    const orderToEdit = orders.find(o => o.id === orderId);
    if (!orderToEdit) return;
    const newData = { ...orderToEdit[type] };
    delete newData[itemKey];
    
    const otherType = type === 'wants' ? 'haves' : 'wants';
    if (Object.keys(newData).length === 0 && Object.keys(orderToEdit[otherType] || {}).length === 0) {
      await rejectOrder(orderId);
    } else {
      const updatedOrder = { ...orderToEdit, [type]: newData };
      delete updatedOrder.id; 
      
      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId),
        updatedOrder
      );
    }
  };

  const manualRemoveSticker = async () => {
    if (!inventory || !removeModalData) return;
    const { type, sectionId, stickerIndex } = removeModalData;

    let newInventory = { ...inventory };

    if (type === 'duplicate') {
      newInventory.duplicateData = newInventory.duplicateData.map((sec) => {
        if (sec.id === sectionId) {
          const newStickers = [...sec.stickers];
          newStickers.splice(stickerIndex, 1);
          return { ...sec, stickers: newStickers };
        }
        return sec;
      });
    } else {
      newInventory.missingData = newInventory.missingData.map((sec) => {
        if (sec.id === sectionId) {
          const newStickers = [...sec.stickers];
          newStickers.splice(stickerIndex, 1);
          return { ...sec, stickers: newStickers };
        }
        return sec;
      });
    }

    await setDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'inventories', user.uid),
      newInventory
    );
    setRemoveModalData(null);
  };

  const restoreDatabase = async () => {
    if (
      window.confirm(
        'Cuidado! Isso apagará suas edições e voltará para a lista original de figurinhas. Deseja continuar?'
      )
    ) {
      await setDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'inventories', user.uid),
        {
          missingData: initialMissingData,
          duplicateData: initialDuplicateData,
        }
      );
    }
  };

  const handleCopyOwner = () => {
    navigator.clipboard.writeText(generateTradeMessage('Dono Simulando'));
    setOwnerCopied(true);
    setTimeout(() => setOwnerCopied(false), 2000);
  };

  const confirmAndUpdateListsOwner = async () => {
    if (!inventory) return;

    const newDuplicates = inventory.duplicateData.map((section) => {
      const remaining = section.stickers.filter((sticker, index) => {
        const key = `${section.id}-${sticker}-${index}`;
        return !selectedWants[key];
      });
      return { ...section, stickers: remaining };
    });

    const newMissing = inventory.missingData.map((section) => {
      const remaining = section.stickers.filter((sticker) => {
        const key = `${section.id}-${sticker}`;
        return !selectedHaves[key];
      });
      return { ...section, stickers: remaining };
    });

    await setDoc(
      doc(db, 'artifacts', appId, 'public', 'data', 'inventories', user.uid),
      {
        missingData: newMissing,
        duplicateData: newDuplicates,
      }
    );

    setSelectedWants({});
    setSelectedHaves({});
    setShowSuccessOwner(true);

    setTimeout(() => {
      setShowSuccessOwner(false);
      setIsModalOpen(false);
    }, 2500);
  };

  if (viewMode === 'owner' && (!user || user.isAnonymous)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
        <UserCircle size={64} className="text-blue-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Acesso do Proprietário</h2>
        <p className="text-slate-400 mb-8 max-w-md">Faça login com sua conta Google para gerenciar seu estoque e pedidos de qualquer dispositivo.</p>
        <button onClick={loginWithGoogle} className="bg-white text-slate-900 font-bold py-3 px-6 rounded-xl flex items-center gap-3 hover:bg-slate-100 transition-colors">
          <UserCircle size={24} className="text-blue-600"/> Entrar com o Google
        </button>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <ArrowRightLeft size={48} className="text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-bold">Carregando estoque...</h2>
      </div>
    );
  }  

  const totalDuplicateCount = inventory.duplicateData.reduce((acc, curr) => {
    const available = curr.stickers.filter((s, i) => !reservedWantsKeys.has(`${curr.id}-${s}-${i}`));
    return acc + available.length;
  }, 0);

  const totalMissingCount = inventory.missingData.reduce((acc, curr) => {
    const available = curr.stickers.filter((s) => !reservedHavesKeys.has(`${curr.id}-${s}`));
    return acc + available.length;
  }, 0);
  
  const clientNameStr = customerName.trim() || 'Amigo Anônimo';
  const whatsappUrlLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    generateTradeMessage(clientNameStr)
  )}`;
  const whatsappUrlLinkOwner = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    generateTradeMessage('Dono Simulando')
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-36">
      {/* Cabeçalho */}
      <header className="bg-slate-900 text-white shadow-lg">
{/* Controle de Visão e Compartilhamento */}
{viewMode === 'owner' && (
          <div className="bg-blue-600 px-4 py-2 text-sm font-medium flex justify-between items-center flex-wrap gap-2">
            <span>Painel de Gerenciamento: <strong>Dono da Loja</strong></span>
            <button 
              onClick={() => {
                const linkCliente = `${window.location.origin}/?loja=${user.uid}`;
                navigator.clipboard.writeText(`Fala! Troca figurinhas da Copa comigo? Escolhe as que você quer no meu app: ${linkCliente}`);
                alert('Mensagem com link copiada! Pode colar no seu WhatsApp.');
              }}
              className="bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded transition-colors flex items-center gap-2 shadow-sm"
            >
              <LinkIcon size={16} /> Copiar Link para Amigos
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex justify-between items-start w-full md:w-auto">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ArrowRightLeft className="text-blue-400" /> Central de Trocas
                Copa 2026
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                {viewMode === 'owner'
                  ? 'Gerencie seu estoque e pedidos em tempo real.'
                  : 'Escolha figurinhas e faça seu pedido!'}
              </p>
            </div>
            {viewMode === 'owner' && (
              <button
                onClick={restoreDatabase}
                className="md:hidden text-slate-400 hover:text-white transition-colors"
                title="Restaurar banco de dados original"
              >
                <RefreshCcw size={20} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab !== 'orders' && (
              <div className="relative flex-1 md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            )}

            {viewMode === 'owner' && (
              <button
                onClick={restoreDatabase}
                className="hidden md:flex bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-300 hover:text-white transition-colors items-center gap-2"
                title="Restaurar banco original"
              >
                <RefreshCcw size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-t border-slate-800">
          <button
            onClick={() => setActiveTab('offer')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-4 font-bold transition-all ${
              activeTab === 'offer'
                ? 'bg-blue-600 text-white border-b-4 border-blue-400'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-b-4 border-transparent'
            }`}
          >
            <Gift size={20} />
            <div className="text-center sm:text-left">
              <span>
              {viewMode === 'owner' ? `Minhas Repetidas (${totalDuplicateCount})` : 'Quero Receber'}              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('need')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-4 font-bold transition-all ${
              activeTab === 'need'
                ? 'bg-emerald-600 text-white border-b-4 border-emerald-400'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-b-4 border-transparent'
            }`}
          >
            <CheckSquare size={20} />
            <div className="text-center sm:text-left">
              <span>
              {viewMode === 'owner' ? `Minhas Faltantes (${totalMissingCount})` : 'Tenho para Trocar'} 
                           </span>
            </div>
          </button>

          {viewMode === 'owner' && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-4 font-bold transition-all relative ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white border-b-4 border-indigo-400'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-b-4 border-transparent'
              }`}
            >
              <div className="relative">
                <Inbox size={20} />
                {orders.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {orders.length}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left">
                <span>Pedidos</span>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Área Principal */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* ABA: PEDIDOS */}
        {activeTab === 'orders' && viewMode === 'owner' && (
          <div className="space-y-6 animate-in fade-in duration-300">


            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Inbox className="text-indigo-600" /> Pedidos Recebidos
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Inbox size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  Nenhum pedido no momento.
                </p>
                <p className="text-slate-400">
                  Use o botão "Trocar Visão" no topo para simular um pedido.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <UserCircle className="text-slate-400" />{' '}
                        {order.customerName}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {new Date(order.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      {Object.keys(order.wants).length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-sm font-bold text-blue-800 mb-2">
                            ELE QUER (Suas Repetidas):
                          </p>
                          <div className="flex flex-wrap gap-1">
                          {Object.entries(order.wants).map(([key, item]) => (
                              <span
                                key={key}
                                className="bg-white border border-blue-200 text-blue-700 text-xs px-2 py-1 flex items-center gap-1 rounded-md font-medium"
                              >
                                {item.sectionName} {item.stickerNumber}
                                <button onClick={() => removeItemFromOrder(order.id, 'wants', key)} className="text-red-500 hover:text-red-700" title="Remover item">
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.keys(order.haves).length > 0 && (
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                          <p className="text-sm font-bold text-emerald-800 mb-2">
                            ELE OFERECE (Suas Faltantes):
                          </p>
                          <div className="flex flex-wrap gap-1">
                          {Object.entries(order.haves).map(([key, item]) => (
                              <span
                                key={key}
                                className="bg-white border border-emerald-200 text-emerald-700 text-xs px-2 py-1 flex items-center gap-1 rounded-md font-medium"
                              >
                                {item.sectionName} {item.stickerNumber}
                                <button onClick={() => removeItemFromOrder(order.id, 'haves', key)} className="text-red-500 hover:text-red-700" title="Remover item">
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-slate-100 flex gap-3">
                      <button
                        onClick={() => approveOrder(order)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                      >
                        <Check size={18} /> Aprovar Troca
                      </button>
                      <button
                        onClick={() => rejectOrder(order.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-medium transition-colors border border-red-200"
                        title="Recusar e Apagar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: OFERECER */}
        {activeTab === 'offer' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {viewMode === 'owner' ? (
              <div className="bg-slate-100 border border-slate-300 p-4 rounded-xl text-slate-600">
                <p>
                  Estoque de repetidas atualizado. Para simular offline, clique
                  em uma figurinha para removê-la manualmente.
                  {viewMode === 'owner' && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-bold text-slate-700 mb-1">País / Seção</label>
                  <select value={newStickerCountry} onChange={(e) => setNewStickerCountry(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Selecione...</option>
                    {initialMissingData.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Número</label>
                  <input type="number" value={newStickerNumber} onChange={(e) => setNewStickerNumber(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 10" />
                </div>
                <button onClick={handleAddSticker} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors h-[42px]">
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            )}
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                <p className="text-blue-800 font-medium">
                  🎁{' '}
                  <strong>
                    Selecione as figurinhas que você quer receber.
                  </strong>
                </p>
              </div>
            )}

            {filteredOfferData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Nenhum país encontrado ou todas acabaram!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOfferData.map((section) => (
                  <div
                    key={`offer-${section.id}`}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-bold text-slate-700">
                        {section.name}
                      </h3>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {section.stickers.map((sticker, index) => {
                        const isSelected =
                          selectedWants[`${section.id}-${sticker}-${index}`];

                        if (viewMode === 'owner') {
                          return (
                            <button
                              key={`o-${section.id}-${sticker}-${index}`}
                              onClick={() =>
                                setRemoveModalData({
                                  type: 'duplicate',
                                  sectionId: section.id,
                                  stickerIndex: index,
                                  stickerNumber: sticker,
                                })
                              }
                              className="w-11 h-11 flex items-center justify-center rounded-lg font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                            >
                              {sticker}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={`w-${section.id}-${sticker}-${index}`}
                            onClick={() =>
                              toggleWant(
                                section.id,
                                sticker,
                                index,
                                section.name
                              )
                            }
                            className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold transition-all duration-200 ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md transform scale-105'
                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {sticker}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: PRECISO */}
        {activeTab === 'need' && (
          <div className="space-y-6 animate-in fade-in duration-300">
{viewMode === 'owner' ? (
              <div className="bg-slate-100 border border-slate-300 p-4 rounded-xl text-slate-600">
                <p className="mb-4">
                  Estoque de faltantes atualizado. Se conseguir uma offline,
                  clique nela para removê-la manualmente da lista.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-700 mb-1">País / Seção</label>
                    <select value={newStickerCountry} onChange={(e) => setNewStickerCountry(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Selecione...</option>
                      {initialMissingData.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Número</label>
                    <input type="number" value={newStickerNumber} onChange={(e) => setNewStickerNumber(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: 10" />
                  </div>
                  <button onClick={handleAddSticker} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors h-[42px]">
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg shadow-sm">
                <p className="text-emerald-800 font-medium">
                  📝{' '}
                  <strong>
                    Selecione as figurinhas que você tem para oferecer.
                  </strong>
                </p>
              </div>
            )}

            {filteredNeedData.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Nenhum país encontrado ou álbum já completo!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNeedData.map((section) => (
                  <div
                    key={`need-${section.id}`}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="font-bold text-slate-700">
                        {section.name}
                      </h3>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {section.stickers.map((sticker, index) => {
                        const isSelected =
                          selectedHaves[`${section.id}-${sticker}`];

                        if (viewMode === 'owner') {
                          return (
                            <button
                              key={`o-${section.id}-${sticker}-${index}`}
                              onClick={() =>
                                setRemoveModalData({
                                  type: 'missing',
                                  sectionId: section.id,
                                  stickerIndex: index,
                                  stickerNumber: sticker,
                                })
                              }
                              className="w-11 h-11 flex items-center justify-center rounded-lg font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                            >
                              {sticker}
                            </button>
                          );
                        }

                        return (
                          <button
                            key={`h-${section.id}-${sticker}`}
                            onClick={() =>
                              toggleHave(section.id, sticker, section.name)
                            }
                            className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold transition-all duration-200 ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md transform scale-105'
                                : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 hover:border-slate-400'
                            }`}
                          >
                            {sticker}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- BARRA INFERIOR (CARRINHO) --- */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] p-4 transition-transform duration-300 z-30 ${
          totalWants > 0 || totalHaves > 0
            ? 'translate-y-0'
            : 'translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full">
                {totalWants}
              </span>
              <span className="text-slate-600 font-medium leading-tight">
                para
                <br />
                {viewMode === 'owner' ? 'doar' : 'receber'}
              </span>
            </div>
            <div className="w-px bg-slate-300 h-8"></div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold w-8 h-8 rounded-full">
                {totalHaves}
              </span>
              <span className="text-slate-600 font-medium leading-tight">
                para
                <br />
                {viewMode === 'owner' ? 'receber' : 'oferecer'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all transform hover:scale-105 flex justify-center items-center gap-2"
          >
            <ArrowRightLeft size={20} />{' '}
            {viewMode === 'owner' ? 'Resumo da Troca' : 'Finalizar Pedido'}
          </button>
        </div>
      </div>

      {/* --- MODAL DO CLIENTE (DOIS PASSOS) --- */}
      {isModalOpen && viewMode === 'client' && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Send size={20} /> Finalizar Pedido
              </h2>
              <button
                onClick={closeClientModal}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {clientOrderStep === 1 ? (
              <>
                <div className="p-6 bg-slate-50">
                  <label className="block text-slate-700 font-bold mb-2">
                    Qual o seu nome?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Oliveira"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                  />

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                    <strong>Passo 1 de 2:</strong> Primeiro, vamos salvar seu
                    pedido no sistema. No próximo passo, você enviará a
                    mensagem pelo WhatsApp.
                  </div>
                </div>
                <div className="p-4 border-t border-slate-200 bg-white">
                  <button
                    onClick={saveOrderToDatabase}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <Save size={20} /> Salvar Pedido
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-8 bg-emerald-50 text-center flex flex-col items-center">
                  <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">
                    Pedido Salvo com Sucesso!
                  </h3>
                  <p className="text-emerald-600 mb-6">
                    Seu amigo já recebeu a notificação no painel dele. Agora,
                    envie a mensagem pelo WhatsApp para combinar a entrega.
                  </p>

                  <a
                    href={whatsappUrlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeClientModal}
                    className="w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl font-bold transition-colors bg-green-500 hover:bg-green-600 text-white shadow-md text-lg"
                  >
                    <Send size={24} /> Enviar para WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL DO DONO (RESUMO DE TRANSAÇÃO OFFLINE) --- */}
      {isModalOpen && viewMode === 'owner' && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {showSuccessOwner ? (
              <div className="p-12 text-center flex flex-col items-center justify-center bg-emerald-50 h-full">
                <CheckCircle2
                  size={80}
                  className="text-emerald-500 mb-4 animate-bounce"
                />
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                  Sucesso!
                </h2>
                <p className="text-emerald-600 font-medium">
                  As figurinhas trocadas foram removidas das suas listas de
                  pendências.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Send size={20} /> Resumo da Simulação (Dono)
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                  <p className="text-slate-600 mb-4 font-medium">
                    Aqui está o resumo manual da troca offline.
                  </p>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono text-sm shadow-inner">
                    {generateTradeMessage('Dono Simulando')}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white flex flex-col gap-3">
                  <button
                    onClick={confirmAndUpdateListsOwner}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <Save size={20} />
                    Confirmar Troca e Atualizar Listas
                  </button>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCopyOwner}
                      className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      {ownerCopied ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Copy size={20} />
                      )}
                      {ownerCopied ? 'Copiado!' : 'Copiar Texto'}
                    </button>

                    <a
                      href={whatsappUrlLinkOwner}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors bg-green-500 hover:bg-green-600 text-white text-center"
                    >
                      <Send size={20} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL DO DONO (REMOVER MANUALMENTE) --- */}
      {removeModalData && viewMode === 'owner' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden p-6 text-center">
            <Trash2 size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Remover Figurinha?
            </h2>
            <p className="text-slate-600 mb-6">
              Deseja baixar a figurinha{' '}
              <strong>{removeModalData.stickerNumber}</strong> do seu estoque
              atual?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveModalData(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={manualRemoveSticker}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL INFORMATIVO SOBRE A PUBLICAÇÃO (COMPARTILHAMENTO) --- */}

    </div>
  );
}
