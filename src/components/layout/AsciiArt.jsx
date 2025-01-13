const UNICORN_ASCII = `                                                                                                         
                                                  .-}}-.                                                 
                                       @@@@@@@@@@@@@@@@@@@@@@@@@@@@#                                     
                                  @@@@@@@@@@@%@@@@@%%@%%@@%%%%%%%@@@@@@@@                                
                              }@@@@@@@@@@@@%@@@@@%%@%%%@%%%%#%####}}[[#@@@@@                             
                            @@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@%###}}}}}[}((}[@@@@-                         
                         @@@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@@@%#[(([((<<><(#@@@                       
                       @@@@@@@@@@@@@%@@@@@@                     @@@@@@[<((<<<>>>(%@@                     
                     @@@@@@@@@@@@@@@@@<                              @@@@[>>>^^++-~(@@                   
                   @@@@@@@@@@@@@@@@                                     @@@}>^^~++^><@@@                 
                  @@@@@@@@@@@@@@[                                          @@}~++^>^>>[@@.               
                +@@@@@@@@@@@@@                        @@@                    @@#<>>><>(<%@+              
               @@@@@@@@@@@@@}                       @@@@@                      @@[<<(((((%@@             
              @@@@@@@@@@@@@                       @@@@@@@                       #@@(<(((([}@@            
             @@@@@@@@@%@@@                      @@@@@@@@@                         @@[([[[#[@@@           
             @@@@@@@%@@@@                     @@@@@@@@@@@                          @@[[}[}}}@@%          
            @@@@@@@%@@@>                   +@@@@@@@@@@@@@                           @@[#}###%@@          
            @@@@%%@@@@@                  @@@@@@@@@@@@@@@@                           @@##}#%#%%@@         
           @@@%@@@@@@@                 @@@@@@@@@@@@@@@@@@                            @@###%%%%@@         
           @@@@@@@%@@@               @@@@@@@@@@@@@@@@@@@@                            @@#%%%%%@@@         
          @@@@@@%%@%@@             @@@@@@@@@@@@@@@@@@@@@@                             @%%%%@%%%@@        
          @@@@%@%%%%@            @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@        @%%@%@%%@@@        
          @@%%%%%%@%@          @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@           @@%%%%@%@@@        
          @@@%%@@%%%@        @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@             @@%%%%@@@@@        
          }@@@%%%%%#@@                             @@@@@@@@@@@@@@@@@@@@              <@%%@@@@@@@@        
           @@%%%%#%#@@                             @@@@@@@@@@@@@@@@@@                @@%@@%@@%@@         
           @@%#%####%@(                            @@@@@@@@@@@@@@@@                  @@@@@@%@@@@         
            @@%####}#@@                            @@@@@@@@@@@@@@                   @@@@@%@@@@@%         
            @@%#}}}}}}@@                           @@@@@@@@@@@@                    @@@@%@@@@@@@          
             @@}(}}([[}@@                          @@@@@@@@@@                     @@@%@@@@@@@@           
              @@#}[[([(}@@                         @@@@@@@@                      @@@@@@@@@@@@@           
               @@[([((<<(@@-                       @@@@@@                       @@@@@@@@@@@@@            
                @@[(<(<><<#@@                      @@@@                       @@@@@@@@@@@@@@             
                 @@#<<>>>>^>%@@                   <@@                       @@@@@@@@@@@@@@               
                  [@@(>>^^++-^@@@                                         @@@@@@@@@@@@@@@                
                    @@%^++-+^>>>%@@@                                   @@@@@@@@@@@@@@@@.                 
                      @@<~+^^^>^<>}@@@@@                           +@@@@@@@@@@@@@@@@@@                   
                        @@@<<^<<(<<([}%@@@@@@<               %@@@@@@@@@@@@@@@@@@@@@#                     
                          @@@@[<(<([(([[[}#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@                        
                             @@@@%[([}}}}}#}%#%#%%%%@@@%%@%@@@@@@@@@@@@@@@@@@@                           
                                @@@@@@#}##%#%#%%%%@@%%%%%@@@@@%@@@@@@@@@@@@.                             
                                    @@@@@@@@@%%%@@@%%%@@@@@@%@@@@@@@@@@@                                 
                                         ~@@@@@@@@@@@@@@@@@@@@@@@@                                       `;

export function AsciiArt({ className = '' }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="transform scale-[1] origin-left">
        <pre 
          className="text-[8px] leading-[8px] font-mono opacity-70 whitespace-pre"
          aria-label="Decorative ASCII art of a unicorn"
          role="img"
          style={{ letterSpacing: '-0.9px' }}
        >
          {UNICORN_ASCII}
        </pre>
      </div>
    </div>
  );
}