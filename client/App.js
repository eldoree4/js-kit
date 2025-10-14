import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, AppState, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';

const API_ENQUEUE = 'https://your-vercel-app.vercel.app/api/enqueue'; // change after deploy

function Button({ title, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[{ padding: 12, borderRadius: 10, backgroundColor: '#2563eb', alignItems:'center' }, style]}>
      <Text style={{ color: 'white', fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [linksText, setLinksText] = useState('');
  const [groups, setGroups] = useState([]);
  const [targets, setTargets] = useState([]);
  const [mode, setMode] = useState('personal');
  const [platform, setPlatform] = useState('telegram');
  const [sending, setSending] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(()=>{
    const sub = AppState.addEventListener('change', next=> { appState.current = next; });
    return ()=> sub.remove();
  },[]);

  function parseLinks(text) {
    const lines = text.split(/\n|,|;/).map(l=>l.trim()).filter(Boolean);
    return lines;
  }

  function autoGroup() {
    const arr = parseLinks(linksText);
    const groupsMap = {};
    arr.forEach(link=>{
      try {
        const url = new URL(link.includes('://') ? link : 'https://'+link);
        const host = url.hostname.replace(/^www\./,'');
        groupsMap[host] = groupsMap[host] || [];
        groupsMap[host].push(link);
      } catch(e){
        groupsMap['others']=groupsMap['others']||[]; groupsMap['others'].push(link);
      }
    });
    const g = Object.keys(groupsMap).map(k=>({ id:k, title:k, links: groupsMap[k] }));
    setGroups(g);
    Alert.alert('Grouped', `Created ${g.length} groups.`);
  }

  function addTarget() {
    Alert.prompt('Add target', 'Enter target identifier (chatId, phone, pageId, or URL)', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: (val)=> { if(val) setTargets(t=>[{ id: Date.now().toString(), label: val, platform }, ...t]); } }
    ]);
  }

  async function sendOfficial() {
    if (groups.length === 0) return Alert.alert('No links', 'Add links and group them first');
    if (targets.length === 0) return Alert.alert('No targets', 'Add at least one target');
    setSending(true);
    try {
      const payload = { userId: 'demo-user', mode: 'official', platform, links: groups.flatMap(g=>g.links), targets, rateLimit: { delay: 1500 } };
      const r = await fetch(API_ENQUEUE, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'enqueue failed');
      Alert.alert('Queued', 'Job queued on server for official-mode sending.');
    } catch(err) {
      Alert.alert('Error', String(err.message || err));
    } finally { setSending(false); }
  }

  async function multiShareSequential() {
    if (groups.length === 0) return Alert.alert('No links', 'Add links and group them first');
    if (targets.length === 0) return Alert.alert('No targets', 'Add at least one target');
    setModalVisible(true);
    for (const tgt of targets) {
      const text = groups.flatMap(g=>g.links).map((l,i)=>`[${i+1}] ${l}`).join('\n');
      try {
        if (tgt.platform === 'whatsapp' || tgt.label.includes('wa.me') || tgt.label.includes('whatsapp')) {
          const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
          await Linking.openURL(url);
        } else if (tgt.platform === 'telegram' || tgt.label.includes('t.me')) {
          const url = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
          await Linking.openURL(url);
        } else if (tgt.platform === 'facebook' || tgt.label.includes('facebook.com')) {
          const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(groups[0].links[0])}`;
          await Linking.openURL(url);
        } else {
          await Linking.openURL(tgt.label);
        }
        await waitForReturn(8000);
      } catch(e) {
        console.warn('open error', e);
      }
    }
    setModalVisible(false);
    Alert.alert('Done', 'Personal-mode sharing sequence completed (user interaction required).');
  }

  function waitForReturn(timeout=8000) {
    return new Promise(resolve=>{
      const start = Date.now();
      const check = setInterval(()=>{
        if (appState.current === 'active' || Date.now()-start > timeout) {
          clearInterval(check);
          resolve();
        }
      },500);
    });
  }

  return (
    <LinearGradient colors={['#0f172a','#061024']} style={{ flex:1, padding:20, paddingTop:60 }}>
      <Text style={{ color:'#cbd5e1', fontSize:28, fontWeight:'800', marginBottom:10 }}>JS Kit Broadcast</Text>
      <Text style={{ color:'#94a3b8', marginBottom:10 }}>Mode: {mode} — Platform: {platform}</Text>

      <View style={{ marginBottom:10 }}>
        <TextInput value={linksText} onChangeText={setLinksText} placeholder="Paste links (one per line or comma)" multiline style={{ minHeight:80, backgroundColor:'#071428', color:'#e2e8f0', padding:12, borderRadius:10 }} />
        <View style={{ flexDirection:'row', marginTop:10, gap:10 }}>
          <Button title="Auto-group" onPress={autoGroup} style={{ flex:1 }} />
          <Button title="Add target" onPress={addTarget} style={{ flex:1, backgroundColor:'#06b6d4' }} />
        </View>
      </View>

      <View style={{ marginBottom:10 }}>
        <Text style={{ color:'#94a3b8', marginBottom:6 }}>Groups ({groups.length})</Text>
        <FlatList data={groups} keyExtractor={g=>g.id} renderItem={({item})=>(
          <View style={{ backgroundColor:'#071028', padding:10, borderRadius:8, marginBottom:8 }}>
            <Text style={{ color:'#e2e8f0', fontWeight:'700' }}>{item.title}</Text>
            <Text style={{ color:'#94a3b8' }}>{item.links.length} links</Text>
          </View>
        )} />
      </View>

      <View style={{ marginBottom:10 }}>
        <Text style={{ color:'#94a3b8', marginBottom:6 }}>Targets ({targets.length})</Text>
        <FlatList data={targets} keyExtractor={t=>t.id} renderItem={({item})=>(
          <View style={{ backgroundColor:'#071028', padding:10, borderRadius:8, marginBottom:8, flexDirection:'row', justifyContent:'space-between' }}>
            <Text style={{ color:'#e2e8f0' }}>{item.label}</Text>
            <Text style={{ color:'#94a3b8' }}>{item.platform}</Text>
          </View>
        )} />
      </View>

      <View style={{ flexDirection:'row', gap:10 }}>
        <Button title="Send (official)" onPress={sendOfficial} style={{ flex:1 }} />
        <Button title="Send (personal)" onPress={multiShareSequential} style={{ flex:1, backgroundColor:'#10b981' }} />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', justifyContent:'center', alignItems:'center' }}>
          <View style={{ backgroundColor:'#071028', padding:20, borderRadius:12, width:'90%' }}>
            <Text style={{ color:'#e2e8f0', marginBottom:10 }}>Personal-mode sequence running</Text>
            <Text style={{ color:'#94a3b8', marginBottom:20 }}>The app will open each target app. Please press SEND in each app to complete sharing.</Text>
            <ActivityIndicator size="large" color="#06b6d4" />
            <View style={{ height:12 }} />
            <Button title="Cancel" onPress={()=>setModalVisible(false)} style={{ backgroundColor:'#ef4444' }} />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
