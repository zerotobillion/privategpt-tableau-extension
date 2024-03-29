import { useEffect, useState } from 'react'
import './App.css'
import { Conversation, DataSource, DataSourceType } from './types'
import HeadBar from './components/HeadBar'
import ConversationsBar from './components/ConversationsBar'
import DatasourcesBar from './components/DatasourcesBar'
import ChatArea from './components/ChatArea'
import { getTableauSheetNames, getTableauSheetData } from './tableau-utils.js'
const { tableau, API_URL, SYSTEM_PROMPT } = window;


const fixedApiUrl = API_URL.replace(/\/+$/, '') + '/v1'
// const API_URL = 'http://localhost:8001/v1'
console.log(fixedApiUrl)
const ChatCompletionUrl = fixedApiUrl + '/chat/completions'
const IngestTextUrl = fixedApiUrl + '/ingest/text'

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number>(1)
  const [datasources, setDatasources] = useState<DataSource[]>([
    { name: 'Tableau' },
    { name: 'Extension' },
    { name: 'Running' },
  ])
  const [loadingDB, setLoadingDB] = useState<boolean>(false)
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)
  const [docIds, setDocIds] = useState<any>({})

  const createNewConversation = () => {
    const newId = conversations.length == 0 ? 1 : conversations[conversations.length - 1].id + 1;
    setConversations(conversations => [...conversations, {
      id: newId,
      name: `Conversation ${newId}`,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
      ],
      datasourceType: 'summary'
    }])
    setCurrentConversationId(newId)
  }

  useEffect(() => {
    createNewConversation()
  }, [])

  useEffect(() => {
    getTableauSheetNames().then((sheetNames: string[]) => {
      setDatasources(sheetNames.map((s: string) => ({ name: s })))
    })
  }, [])

  const findConversationById = (id: number) => {
    const filtered = conversations.filter((conversation: Conversation) => conversation.id == id)
    return filtered.length > 0 ? filtered[0] : null;
  }

  const currentConversation = findConversationById(currentConversationId)

  const clearConversation = () => {
    setConversations(conversations => conversations.map((conversation: Conversation) => {
      if (conversation.id == currentConversationId) {
        return {
          ...conversation,
          messages: []
        }
      } else {
        return conversation
      }
    }))
  }

  const changeConversationName = (convId: number, newName: string) => {
    setConversations(conversations => conversations.map((conversation: Conversation) => (
      conversation.id == convId ? {
        ...conversation,
        name: newName
      } : conversation
    )))
  }

  const removeConversation = (convId: number) => {
    setConversations(conversations => conversations.filter((conversation: Conversation) => conversation.id != convId))
  }

  const findDatasourceByName = (name: string) => {
    const filtered = datasources.filter((datasource: DataSource) => datasource.name == name)
    return filtered.length > 0 ? filtered[0] : null;
  }

  const changeDatasource = (newDatasourceName: string, newDatasourceType: DataSourceType) => {
    const datasource = findDatasourceByName(newDatasourceName)
    if (!datasource) return
    setConversations(conversations => conversations.map((conversation: Conversation) => (
      conversation.id == currentConversationId ? {
        ...conversation,
        datasource: datasource,
        datasourceType: newDatasourceType
      } : conversation
    )))

    const key = newDatasourceName + '-' + newDatasourceType
    if (!docIds[key]) {
      setLoadingDB(true)
      getTableauSheetData(newDatasourceName, newDatasourceType).then((data: any) => {
        fetch(IngestTextUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
          },
          body: JSON.stringify({
            file_name: key + '.txt',
            text: data
          })
        }).then(resp => resp.json())
          .then(resp => {
            const doc_id = resp.data[0].doc_id
            setDocIds((docIds: any) => {
              const newIds = {...docIds}
              newIds[key] = doc_id
              return newIds
            })
            setLoadingDB(false)
          })
      })
    }
  }

  const newUserMessage = async (message: string) => {
    if (!currentConversation) return
    const old_messages = JSON.parse(JSON.stringify(currentConversation?.messages));
    const convId = currentConversationId;

    setConversations((conversations: Conversation[]) => conversations.map((conversation: Conversation) => (
      conversation.id == convId ? {
        ...conversation,
        messages: [
          ...conversation.messages,
          {
            role: 'user',
            content: message
          }
        ]
      } : conversation
    )))

    setLoadingResponse(true)

    console.log(docIds)
    const docId = currentConversation.datasource ? docIds[currentConversation.datasource.name + '-' + currentConversation.datasourceType] : null
    const contextParams = docId ? {
      "use_context": true,
      "context_filter": {
        "docs_ids": [
          docId
        ]
      },
      "include_sources": false,
    } : {}
    
    const response = await fetch(ChatCompletionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json"
      },
      body: JSON.stringify({
        "messages": [
          ...old_messages,
          {
            role: 'user',
            content: message
          }
        ],
        ...contextParams,
        "stream": true
      })
    })

    if (!response.ok || !response.body) {
      throw response.statusText;
    }

    // Here we start prepping for the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const loopRunner = true;

    while (loopRunner) {
      // Here we start reading the stream, until its done.
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const decodedChunk = decoder.decode(value, { stream: true });
      const chunks = decodedChunk.split('data: ');
      for (let chunk of chunks) {
        chunk = chunk.trim()
        if (!chunk) continue
        if (chunk == '[DONE]') {
          setLoadingResponse(false)
        } else {
          chunk = JSON.parse(chunk)
          // @ts-ignore
          let answer = chunk.choices[0].delta.content

          setConversations((conversations: Conversation[]) => conversations.map((conversation: Conversation) => {
            if (conversation.id != convId) return conversation
            const old_messages = conversation.messages
            let new_messages;
            if (old_messages.length > 0 && old_messages[old_messages.length - 1].role == 'assistant') {
              new_messages = [...old_messages.slice(0, -1), { role: 'assistant', content: old_messages[old_messages.length - 1].content + answer }]
            } else {
              new_messages = [...old_messages, { role: 'assistant', content: answer }]
            }
            return { ...conversation, messages: new_messages }
          }))
        }
      }
    }
  }

  return (
    <>
      <div className='h-screen pl-44 w-screen flex flex-col h-screen'>
        <HeadBar title={currentConversation?.name || ''} onClearConversation={clearConversation} child={<DatasourcesBar datasources={datasources} selectedDatasourceName={currentConversation?.datasource?.name || ''}
          selectedDatasourceType={currentConversation?.datasourceType || 'summary'} onChangeDataSource={changeDatasource}></DatasourcesBar>}></HeadBar>
        <ChatArea conversation={currentConversation} loading={loadingDB || loadingResponse} onNewMessage={newUserMessage}></ChatArea>
      </div>
      <ConversationsBar conversations={conversations} currentConversationId={currentConversationId} onNewConversation={createNewConversation}
        onClickConversation={setCurrentConversationId} onChangeConversationName={changeConversationName} onRemoveConversation={removeConversation}></ConversationsBar>

    </>
  )
}

export default App
