import React, { useEffect, useRef, useState } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import axios from 'axios';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("cpp");
    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'C', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);

    
    
    const handleSubmit = async () => {
        // await console.log(editorRef.current.getValue());
        try {
            const payload = {
                language,
                code: editorRef.current.getValue()
            };
            console.log(payload)
            const {data} = await axios.post("http://localhost:5000/run", payload);
            setOutput(data.output);
        } catch (err) {
            console.log(err.response);
        }
    };
    

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    return (
        <div>
            <button className="btn Run" onClick={handleSubmit}>RUN</button> 
            <div className='language'>
                <label>Language:</label>
                <select
                    value={language}
                    onChange={
                        (e) => {
                            setLanguage(e.target.value);
                            console.log(e.target.value);
                        }
                    }
                >
                    <option value="cpp">c++</option>
                    <option value="py">python</option>
                </select>
            </div>
            <textarea id="realtimeEditor"></textarea>
            <div className='output-box'>
                <p className='output'>{output}</p>
            </div>
        </div>
  
    );
};

export default Editor;