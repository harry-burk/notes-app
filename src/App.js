import React from "react"
import {useState, useEffect} from 'react'
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import { data } from "./data"
import Split from "react-split"
import {nanoid} from "nanoid"

export default function App() {   
    const [notes, setNotes] = useState(
    	// Here we lazily initiate the state
		// We do this here as we only require reaching into LocalStorage once — on load — as the rest of the time it is being 'set' rather than 'got'
		// Using an function with imperative return is an easy way to make this more performant and stop the app from reaching into LocalStorage every time the app re-renders
    	() => JSON.parse(localStorage.getItem('notes')) || []
    )
    const [currentNoteId, setCurrentNoteId] = useState(
        (notes[0] && notes[0].id) || ""
    )
    
    function createNewNote() {
        const newNote = {
            id: nanoid(),
            body: "# Type your markdown note's title here if you're a dingus"
        }
        setNotes(prevNotes => [newNote, ...prevNotes])
        setCurrentNoteId(newNote.id)
    }    
    
    function updateNote(text) {
    	// Old method, does not rearrange
        // setNotes(oldNotes => oldNotes.map(oldNote => {
        //     return oldNote.id === currentNoteId ? { ...oldNote, body: text } : oldNote
        // }))

        // New method, places most modified notes at the top of the list
        setNotes(oldNotes => {
        	const newNotes = []
        	
        	for(let i = 0; i < oldNotes.length; i++) {
        		const oldNote = oldNotes[i]
        		
        		if(oldNote.id === currentNoteId) {
        			newNotes.unshift({...oldNote, body: text})
        		} else {
        			newNotes.push(oldNote)
        		}        		
        	}

        	return newNotes
        })
    }
    
    function findCurrentNote() {
        return notes.find(note => {
            return note.id === currentNoteId
        }) || notes[0]
    }

    // Delete note
    function deleteNote(event, noteId) {
        event.stopPropagation()

        setNotes(oldNotes => {
        	return oldNotes.filter(note => note.id != noteId)
        })
    }

    // Save our notes to localStorage every time one is changed
    useEffect(() => {
    	localStorage.setItem('notes', JSON.stringify(notes))
    }, [notes])
    
    return (
        <main>
	        { notes.length > 0 ?
	        	<Split sizes={[30, 70]} direction="horizontal" className="split">
	                <Sidebar notes={notes} currentNote={findCurrentNote()} setCurrentNoteId={setCurrentNoteId} newNote={createNewNote} deleteNote={deleteNote} />
	                { currentNoteId && notes.length > 0 && <Editor currentNote={findCurrentNote()} updateNote={updateNote} /> }
	            </Split>
	        :
	            <div className="no-notes">
	                <h1>You have no notes</h1>
	                <button className="first-note" onClick={createNewNote}>
	                    Create one now
	                </button>
	            </div>            
	    	}
        </main>
    )
}
