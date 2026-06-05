def center_text_x (text, container_widht):
    bbox = text.get_bbox()
    text_widht = bbox[2] - bbox[0]
    return (container_widht - text_widht) // 2

def wrap_text(text, font, max_width):
    # separa todas as palavras do texto
    words = text.split()

    #onde cada linha será armazenada
    lines = []

    #linha sendo contruida
    current_line = ""

    for word in words:
      #testa se a linha atual mais a próxima palavra ultrapassa a largura máxima (.strip remove espaços extras no início e no final)
      test_line = f"{current_line} {word}".strip()
      
      #Pega a caixa delimitadora do texto de teste, que é a menor caixa retangular que pode conter o texto. O resultado é uma tupla (left, top, right, bottom).
      bbox = font.getbbox(test_line)
      #A largura do texto é calculada subtraindo a coordenada x do canto esquerdo (bbox[0]) da coordenada x do canto direito (bbox[2]).
      line_width = bbox[2] - bbox[0]

      if line_width <= max_width:
        current_line = test_line
      else:
        lines.append(current_line)
        current_line = word
    if current_line:
      lines.append(current_line)
    return lines