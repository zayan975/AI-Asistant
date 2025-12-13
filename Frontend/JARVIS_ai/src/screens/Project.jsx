import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/userContext'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios.js'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket.js'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer.js'

function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)
            ref.current.removeAttribute('data-highlighted')
        }
    }, [props.className, props.children])

    return <code {...props} ref={ref} />
}

function safeJsonParse(raw) {
    try {
        return JSON.parse(raw.replace(/```json|```/g, '').trim())
    } catch {
        return null
    }
}

const Project = () => {
    const location = useLocation()
    const { user } = useContext(UserContext)
    const messageBox = useRef(null)

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(location.state.project)
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [fileTree, setFileTree] = useState({})
    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])
    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)
    const [runProcess, setRunProcess] = useState(null)

    const handleUserClick = (id) => {
        setSelectedUserId(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) newSet.delete(id)
            else newSet.add(id)
            return newSet
        })
    }

    function addCollaborators() {
        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => setIsModalOpen(false))
          .catch(err => console.log(err))
    }

    const send = () => {
        sendMessage('project-message', { message, sender: user })
        setMessages(prev => [...prev, { sender: user, message }])
        setMessage("")
    }

    function WriteAiMessage(message) {
        const msg = safeJsonParse(message) || { text: message }
        return (
            <div className='overflow-auto bg-purple-700 text-white rounded-md p-3'>
                <Markdown children={msg.text} options={{ overrides: { code: SyntaxHighlightedCode } }} />
            </div>
        )
    }

    useEffect(() => {
        initializeSocket(project._id)
        if (!webContainer) getWebContainer().then(c => setWebContainer(c))
        receiveMessage('project-message', data => {
            if (data.sender._id === 'ai') {
                const msg = safeJsonParse(data.message)
                webContainer?.mount(msg?.fileTree)
                if (msg?.fileTree) setFileTree(msg.fileTree)
            }
            setMessages(prev => [...prev, data])
        })
        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })
        axios.get('/users/all').then(res => setUsers(res.data.users)).catch(err => console.log(err))
    }, [])

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', { projectId: project._id, fileTree: ft }).catch(err => console.log(err))
    }

    return (
        <main className='h-screen w-screen flex flex-col md:flex-row bg-gradient-to-r from-indigo-50 via-pink-50 to-yellow-50'>

            {/* Left Panel */}
            <section className="left relative flex flex-col h-screen min-w-96 bg-white shadow-lg">
                <header className='flex justify-between items-center p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-b-xl shadow-md sticky top-0 z-10'>
                    <button className='flex gap-2 items-center hover:scale-105 transition transform' onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill"></i> Add collaborator
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2 rounded-full bg-white/20 hover:bg-white/30 transition'>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>

                <div className="conversation-area pt-16 pb-16 grow flex flex-col h-full relative">
                    <div ref={messageBox} className="message-box p-2 grow flex flex-col gap-2 overflow-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-200">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`${msg.sender._id === 'ai' ? 'max-w-80 bg-purple-100' : 'max-w-52 bg-white'} ${msg.sender._id === user._id && 'ml-auto'} p-3 rounded-lg shadow flex flex-col`}>
                                <small className='opacity-70 text-xs text-gray-600'>{msg.sender.email}</small>
                                <div className='text-sm mt-1'>
                                    {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p>{msg.message}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="inputField w-full flex absolute bottom-0 p-2 gap-2 bg-white shadow-inner rounded-t-lg">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='p-2 px-4 border border-gray-300 rounded-lg grow outline-none focus:ring-2 focus:ring-purple-400'
                            placeholder='Enter message'
                        />
                        <button onClick={send} className='px-5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition'>
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>

                <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-white absolute transition-transform ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0 shadow-lg`}>
                    <header className='flex justify-between items-center p-4 bg-purple-100 rounded-b-md'>
                        <h1 className='font-semibold text-lg text-purple-700'>Collaborators</h1>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2 rounded-full hover:bg-purple-200 transition'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col gap-2 p-2 overflow-auto">
                        {project.users?.map(u => (
                            <div key={u._id} className='user cursor-pointer hover:bg-purple-50 p-2 flex gap-2 items-center rounded-md transition'>
                                <div className='w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center'>
                                    <i className="ri-user-fill"></i>
                                </div>
                                <h1 className='font-semibold text-lg text-gray-800'>{u.email}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Right Panel */}
            <section className="right grow flex flex-col md:flex-row gap-2 p-2">
                <div className="explorer h-full max-w-64 min-w-52 bg-gradient-to-b from-pink-50 to-pink-100 rounded-lg p-2 shadow overflow-auto">
                    {Object.keys(fileTree).map((file, idx) => (
                        <button key={idx} onClick={() => { setCurrentFile(file); setOpenFiles([...new Set([...openFiles, file])]); }}
                            className={`w-full text-left p-2 rounded hover:bg-pink-200 transition ${currentFile === file ? 'bg-pink-300 font-semibold' : ''}`}>
                            {file}
                        </button>
                    ))}
                </div>

                <div className="code-editor flex flex-col grow bg-white rounded-lg shadow overflow-hidden">
                    <div className="top flex justify-between p-2 border-b border-gray-200">
                        <div className="files flex gap-2 overflow-x-auto">
                            {openFiles.map((file, idx) => (
                                <button key={idx} onClick={() => setCurrentFile(file)}
                                    className={`px-3 py-1 rounded-md ${currentFile === file ? 'bg-indigo-200 font-semibold' : 'bg-gray-100'} hover:bg-indigo-100 transition whitespace-nowrap`}>
                                    {file}
                                </button>
                            ))}
                        </div>
                        <div className="actions">
                            <button className='px-4 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition'>Run</button>
                        </div>
                    </div>
                    <div className="bottom grow overflow-auto p-2">
                        {fileTree[currentFile] && (
                            <pre className='bg-gray-50 p-2 rounded-md overflow-auto'>
                                <code
                                    className='outline-none'
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={e => {
                                        const updatedContent = e.target.innerText
                                        const ft = { ...fileTree, [currentFile]: { file: { contents: updatedContent } } }
                                        setFileTree(ft)
                                        saveFileTree(ft)
                                    }}
                                    dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value }}
                                />
                            </pre>
                        )}
                    </div>
                </div>

                {iframeUrl && webContainer && (
                    <div className="flex flex-col min-w-96 h-full bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-lg shadow overflow-hidden">
                        <input type="text" value={iframeUrl} onChange={e => setIframeUrl(e.target.value)}
                            className='p-2 border-b border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none' />
                        <iframe src={iframeUrl} className="w-full h-full"></iframe>
                    </div>
                )}
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 max-w-full shadow-lg relative">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold text-purple-600'>Select Users</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2 rounded-full hover:bg-purple-100 transition'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 max-h-80 overflow-auto mb-16">
                            {users.map(u => (
                                <div key={u._id} onClick={() => handleUserClick(u._id)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-purple-50 ${selectedUserId.has(u._id) ? 'bg-purple-100' : ''}`}>
                                    <div className='w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center'>
                                        <i className="ri-user-fill"></i>
                                    </div>
                                    <p className='font-medium text-gray-800'>{u.email}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={addCollaborators}
                            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project
