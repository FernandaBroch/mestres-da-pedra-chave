
# Mestras da Pedra Chave

Site que calcula a pontuação do campeonato de Mythic Plus realizado na Twitch:
- Daniel Black Belt https://www.twitch.tv/danielblackbelt

## Detalhamanto
Os resultados são obtidos pela API do raider IO
- [Raider IO](https://raider.io/api#/mythic_plus/getApiV1MythicplusScoretiers)

Eles são calculados obtendo o resultado do campo "mythic_plus_recent_runs" e filtrando por maiores que a data especificada.
Os pontos totais são a soma do campo "score" da dungeons realizada em datas posteriores a data inserida.

## Screenshots

<img src="images/site1.png" width="500">

## Demo

- [https://legendary-granita-b2709c.netlify.app/](https://legendary-granita-b2709c.netlify.app/)

