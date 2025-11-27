    // 🔥 SUAS CONFIGURAÇÕES DO FIREBASE
    const firebaseConfig = {
        apiKey: "AIzaSyCfDLcFEvWSir9fAhjzwBlq2X75PJwN9c4",
        authDomain: "projeto-final-49d86.firebaseapp.com",
        projectId: "projeto-final-49d86",
        storageBucket: "projeto-final-49d86.firebasestorage.app",
        messagingSenderId: "690462093684",
        appId: "1:690462093684:web:05a9ecc5253af15c06fc21",
        measurementId: "G-H42DE917G4"
    };

    // Inicializar Firebase
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase inicializado com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }

    const auth = firebase.auth();

    // Função para verificar se Firebase está funcionando
    function checkFirebaseConnection() {
        return new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe();
                resolve(true);
            }, error => {
                console.error("Erro na conexão Firebase:", error);
                resolve(false);
            });
        });
    }

    // Form submission
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = document.getElementById('submitBtn');
        
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            showMessage('Por favor, preencha todos os campos!', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Senhas não coincidem!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }
        
        // Desabilitar botão durante o processamento
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cadastrando...';
        showMessage('Processando cadastro...', 'loading');
        
        try {
            // Verificar conexão com Firebase
            const isConnected = await checkFirebaseConnection();
            if (!isConnected) {
                throw new Error('Sem conexão com o servidor. Tente novamente.');
            }
            
            // 1. Cadastrar no Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // 2. Atualizar perfil com nome
            await user.updateProfile({
                displayName: name
            });
            
            // 3. Enviar email de verificação (opcional)
            // await user.sendEmailVerification();
            
            // ✅ REMOVIDA A CHAMADA PARA sendToPython
            console.log('Usuário criado com sucesso:', {
                uid: user.uid,
                name: name,
                email: email
            });
            
            // Sucesso
            showMessage('Cadastro realizado com sucesso!', 'success');
            document.getElementById('registerForm').reset();
            
            // Redirecionar após 2 segundos (opcional)
            setTimeout(() => {
                // window.location.href = '/login.html'; // descomente se quiser redirecionar
            }, 2000);
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            
            // Mensagens de erro mais amigáveis
            let errorMessage = 'Erro no cadastro: ';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage += 'Este email já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Email inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage += 'Senha muito fraca.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage += 'Erro de conexão. Verifique sua internet.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            showMessage(errorMessage, 'error');
        } finally {
            // Reabilitar botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'Cadastrar';
        }
    });

    function showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = 'message ' + type;
        messageElement.style.display = 'block';
        
        // Auto-esconder apenas para mensagens de sucesso/erro
        if (type !== 'loading') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }

    // Verificação inicial da conexão
    window.addEventListener('load', async () => {
        const isConnected = await checkFirebaseConnection();
        if (!isConnected) {
            showMessage('Aviso: Problema de conexão. Algumas funcionalidades podem não estar disponíveis.', 'error');
        }
    });