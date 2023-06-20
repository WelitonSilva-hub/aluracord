import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { ButtonSendSticker } from "../src/components/ButtonSendSticker"

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzY4NTI0MCwiZXhwIjoxOTU5MjYxMjQwfQ.tNZ9u0lSL0_y4WwYtBiC2cXzGjJa_37-anTuN0mU_OE'
const SUPABASE_URL = 'https://lwphjmvidrilpudwicue.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
            .from('mensagens')
            .on('INSERT', (respostaLive) => {
                //console.log('Houve uma nova mensagem')
                adicionaMensagem(respostaLive.new)
            })
            .subscribe();
}

export default function ChatPage() {
    /*
        // Usuário
        - Usuário digita no campo textArea
        - Aperta o Enter para enviar
        - Tem que adicionar o texto na listagem

        //Dev
        - [x] Campo criado
        - [X] Será usado o onChange e useState (ter if para caso o enter seja para limpar a variável)
        - [X] Lista de mensagens
    */


    const [mensagem, setMensagem] = React.useState('');
    const [listaMensagens, setListaMensagens] = React.useState([
        // {
        //     id: 1,
        //     de: "WelitonSilva-hub",
        //     texto: ':sticker: http://2.bp.blogspot.com/-d21tffsTIQo/U_H9QjC69gI/AAAAAAAAKqM/wnvOyUr6a_I/s1600/Pikachu%2B2.gif',
        // }
    ]);
    // routers tem acesso a tudo relacionado a URL
    const roteamento = useRouter()

    React.useEffect(() => {
        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                console.log("Supabase:", data)
                setListaMensagens(data)
            });

        escutaMensagensEmTempoReal((novaMensagem) => {
            setListaMensagens((valorAtualDaLista) => {
                return [
                        data[0],
                    ...valorAtualDaLista,
                ]
            });
        });
    }, []);

    function handleNovaMensagem(novaMensagem) {
        const objMensagem = {
            //id: listaMensagens.length + 1,
            // A query do router pega os parâmetros passados na URL
            de: roteamento.query.username,
            texto: novaMensagem,
        }

        supabaseClient
            .from('mensagens')
            .insert([
                // Tem de ser um objeto com os MESMOS CAMPOS do supabase
                objMensagem
            ])
            .then(({ data }) => {
                console.log("Criando nova mensagem: ", data)
                // setListaMensagens([
                //     data[0],
                //     ...listaMensagens,
                // ]);
            })
            
            setMensagem('');
    };

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList mensagens={listaMensagens} />
                    {/* {listaMensagens.map((mensagemAtual) => {
                        return (
                            <li key={mensagemAtual.id} style={{ paddingBottom: '5px' }}>
                                {mensagemAtual.de}: {mensagemAtual.texto}
                            </li>
                        )
                    })} */}

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                setMensagem(event.target.value)
                            }}
                            onKeyPress={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker 
                            onStickerClick={(sticker) => {
                                //console.log('[USANDO O COMPONENTE] salva esse sticker no banco', sticker)
                                handleNovaMensagem(':sticker: ' + sticker)
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    console.log('MessageList', props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >

            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                                display: 'flex'
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {mensagem.texto.startsWith(":sticker:")
                            ? <Image src={mensagem.texto.replace(":sticker: ", '')} />
                            : mensagem.texto
                        }
                        {/* {mensagem.texto} */}
                    </Text>
                )
            })}
        </Box>
    )
}