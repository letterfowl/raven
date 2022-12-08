const Swing = require('swing');
const supabase = require("@supabase/supabase-js");

// Prepare the cards in the stack for iteration.
const c_stack = document.querySelector('ul')

// An instance of the Stack is used to attach event listeners.
const stack = Swing.Stack();
const db = supabase.createClient(
        'https://aiqhvxquehfxwsbsgppz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcWh2eHF1ZWhmeHdzYnNncHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAyNDIyMzksImV4cCI6MTk4NTgxODIzOX0.GiUtg3AXI4T1_c34L8-sw6ycWuzDpTjVYgzgxHWKEog'
    )

const user = window.prompt("User:", 'anon')

async function genCard(am, start) {
    const { data, error } = await db.rpc('get_next', {am, start})
    if (error) {
        console.error(error);
    }
    var c_element;
    data.forEach((item) => {
        c_element = document.createElement("li")
        c_element.innerHTML = `<header>${item.word}</header><p>${item.hint}</p>`
        c_element.dataset.wordId = item.id
        c_stack.prepend(c_element)
        stack.createCard(c_element, true)
    })
}

genCard(3, 0);

// Add event listener for when a card is thrown out of the stack.
stack.on('throwout', async (event) => {
    // e.target Reference to the element that has been thrown out of the stack.
    // e.throwDirection Direction in which the element has been thrown (Direction.LEFT, Direction.RIGHT).

    console.log('out ' + (event.throwDirection == Swing.Direction.LEFT ? 'left' : 'right'));
    event.target.parentNode.removeChild(event.target);
    const { error } = await db
        .from('decisions').insert({
            word: event.target.dataset.wordId,
            is_good: event.throwDirection == Swing.Direction.RIGHT,
            annotator: user
        })
    if (error) {
        console.error(error);
    }
    genCard(1, parseInt(event.target.dataset.wordId)+2);
});

// Add event listener for when a card is thrown in the stack, including the spring back into place effect.
// stack.on('throwin', () => {
//     console.log('snapped back');
// });