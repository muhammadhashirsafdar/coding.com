import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    getDocs,
    onSnapshot,
    where,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyAisUQ56kvMlxuLBOphUBRmaXnSyvISuJs',
	authDomain: 'my-first-firebase-web-16059.firebaseapp.com',
	projectId: 'my-first-firebase-web-16059',
	storageBucket: 'my-first-firebase-web-16059.appspot.com',
	messagingSenderId: '9472139794',
	appId: '1:9472139794:web:24c8c2aebcc03f0e566ecb',
	measurementId: 'G-Z1PPSSM5WC'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const signupbtn = document.getElementById('signbtn');
const logOutbtn = document.getElementById('logout-btn');

let questionIds = [];

const handleRedirectToAnswer = (questionId) => {
    localStorage.setItem('questionId', questionId);
    window.location.href = 'answer.html';
};

const attachReadmoreButtonListeners = () => {
    const readmoreButtons = document.querySelectorAll('.readmore-btn');
    
    readmoreButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const questionId = questionIds[index];
            handleRedirectToAnswer(questionId);
        });
    });
};

const fetchQuestionsFromFirestore = async () => {
    const db = getFirestore(app);
    const questionsList = document.getElementById('object-list');

    try {
        const querySnapshot = await getDocs(collection(db, 'Questions'));
        let html = '';
        querySnapshot.forEach((doc) => {
            const question = doc.data();
            
            if (!document.getElementById(`question-${question.id}`)) {
                questionIds.push(question.id);
                html += `<li id="question-${question.id}" class="reactjs"><h1 class="">${question.heading}</h1><p>${question.questions} <span id="readmore-button" class="readmore-btn">Read more...</span></p></li>`;
            }
        });
        questionsList.innerHTML = html;
        attachReadmoreButtonListeners();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};





const questionCancelBtn = document.getElementById("question-cancel");
const questionSaveBtn = document.getElementById('question-save');
const headingInput = document.getElementById('heading-input');
const textArea = document.getElementById('text-area');

if (questionSaveBtn) {
    questionSaveBtn.addEventListener('click', async function () {
        const db = getFirestore(app);
        const headingInputValue = headingInput.value.trim();
        const textAreaValue = textArea.value.trim();
        const timestamp = new Date().getTime();

if(headingInputValue && textAreaValue){
        const payload = {
            id: timestamp,
            heading: headingInputValue,
            questions: textAreaValue,
        };

        try {
            const docRef = await addDoc(collection(db, 'Questions'), payload);
            console.log('Document written with ID: ', docRef.id);
        } catch (e) {
            console.error('Error adding document: ', e);
        }

        headingInput.value = '';
        textArea.value = '';
        window.location.href = "coding.html";
    }else{
        alert("Please input both heading and questions.")
    }
    });
}

questionCancelBtn && questionCancelBtn .addEventListener('click',()=>{
    headingInput.value = '';
    textArea.value = '';
    window.location.href = "coding.html"
})

const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
        .then(() => {
            alert('User signed out successfully.');
            window.location.href = '/';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
};

signupbtn && signupbtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.log(error);
        });
});

logOutbtn && logOutbtn.addEventListener('click', handleSignOut);

document.addEventListener('DOMContentLoaded', () => {
    const currentPageName = window.location.pathname.split('/').pop();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (
                currentPageName !== 'coding.html' &&
                currentPageName !== 'question.html' &&
                currentPageName !== 'answer.html' &&
                currentPageName !== 'aboutus.html' 
                
            ) {
                window.location.href = 'coding.html';
            }
        } else {
            if (currentPageName !== '' && currentPageName !== 'index.html') {
                window.location.href = '/';
            }
        }
    });

    const askbtn = document.getElementById('question-btn');

        const handleRedirectingToQuestionPage = () => {
            if (currentPageName === 'coding.html') {
                window.location.href = 'question.html';
            } else {
                console.log('already on question.html');
            }
        };
    
    askbtn && askbtn.addEventListener('click', handleRedirectingToQuestionPage);

    let baricon = document.getElementById('icon');
    let sidemenu = document.getElementById('sidemenu');
    // let js = document.getElementById('content');
    let textarea = document.getElementById('text-area');

    baricon && baricon.addEventListener('click', function () {
        if (sidemenu.style.display === 'none' || sidemenu.style.display === '') {
            sidemenu.style.display = 'block';
            baricon.className = 'fa-solid fa-xmark fa-2xl';
            // js.style.marginRight = '16rem';
            textarea.setAttribute('cols', '180');
        } else {
            sidemenu.style.display = 'none';
            baricon.className = 'fa-solid fa-bars fa-2xl';
            // js.style.marginRight = '0rem';
            textarea.setAttribute('cols', '195');
        }
    });

    fetchQuestionsFromFirestore();
    
});




document.addEventListener('DOMContentLoaded',async () => {
    const questionId = localStorage.getItem('questionId');
    if (questionId) {
        await displayAnswers(questionId);
    } else {
        console.error('Question ID not found.');
    }
    
});

const textAreaValue = document.getElementById('text-area');
const answerSavebtn = document.getElementById('answer-save');
const answerCancelBtn = document.getElementById("answer-cancel");
if (answerSavebtn){

    
    answerSavebtn.addEventListener('click', async () => {
        const answertextAreaValue = textAreaValue.value;
        const questionId = localStorage.getItem('questionId');
        
        if(answertextAreaValue.trim()){
        if (!questionId) {
            console.error('Question ID not found.');
            return;
        }
        
        const db = getFirestore(app);
        const timestamp = new Date().getTime();
        
        const payload = {
            id: timestamp,
            questionId: questionId,
            text: answertextAreaValue,
        };

        try {
            await addDoc(collection(db, 'Answers'), payload);
            console.log('Answer added successfully.');
            await displayAnswers(questionId);
        } catch (error) {
            console.error('Error adding answer:', error);
        }
    }else{
        alert("please input first")
    }
    });
}

answerCancelBtn && answerCancelBtn.addEventListener('click',()=>{
    textAreaValue.value=""
    window.location.href = "coding.html"
})

const displayAnswers = async (questionId) => {
    const answers = await fetchAnswersForQuestion(questionId);
    const answersList = document.getElementById('answers-list');

    if (answers.length === 0) {
        answersList.innerHTML = '<p>No answers found for this question.</p>';
    } else {
        const html = answers.map(answer => `<li class="reactjs ">${answer.text}</li>`).join('');
        answersList.innerHTML = `<ol>${html}</ol>`;
        textAreaValue.value="";
    }
};

const fetchAnswersForQuestion = async (questionId) => {
    const db = getFirestore(app);
    const answersRef = collection(db, 'Answers');
    const queryAnswers = query(answersRef, where('questionId', '==', questionId));

    try {
        const querySnapshot = await getDocs(queryAnswers);
        const answers = [];
        querySnapshot.forEach((doc) => {
            const answerData = doc.data();
            answers.push(answerData);
        });
        return answers;
    } catch (error) {
        console.error('Error fetching answers:', error);
        return [];
    }
}


const homePagebtn = document.getElementById("homepage");

homePagebtn && homePagebtn.addEventListener('click',()=>{
    window.location.href = "coding.html"
})

const aboutusbtn = document.getElementById("aboutusbtn")

aboutusbtn && aboutusbtn.addEventListener('click',()=>{
    window.location.href = "aboutus.html"
})

